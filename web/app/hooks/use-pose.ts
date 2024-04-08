import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import * as ort from "onnxruntime-web";

import { getCanvasDimension } from "@/lib/get-canvas-dimension";

import { useAsync } from "./use-async";

export type UsePoseReturn = [
	state: {
		isLoading: boolean;
		video: RefObject<HTMLVideoElement | undefined>;
	},
	actions: {
		forwardVideo: () => void;
		rewindVideo: () => void;
		setCanvas: (ref: HTMLCanvasElement) => void;
		setVideo: (ref: HTMLVideoElement) => void;
		setVideoSrc: (url: string) => void;
		setVideoVolume: (volume: number) => void;
		toggleVideoPlayState: () => void;
	},
];

// Hook for pose detection. Requires a canvas and video element to be set
//
// TODO: Play around different ONNXRuntime backends
export function usePose(): UsePoseReturn {
	const canvas = useRef<HTMLCanvasElement>();
	const context = useRef<CanvasRenderingContext2D>();
	const raf = useRef<number>();
	const session = useRef<{ net: ort.InferenceSession; nms: ort.InferenceSession }>();
	const video = useRef<HTMLVideoElement>();

	const [isLoading, toggleIsLoading] = useState(true);

	// Sets canvas dimension
	const loadVideo = async () => {
		if (!canvas.current || !video.current) {
			return;
		}

		const { height, width } = getCanvasDimension(video.current);
		canvas.current.width = width;
		canvas.current.height = height;
	};

	// TODO: Figure out a way to optimize this
	const processVideo = useCallback(async () => {
		if (!canvas.current || !context.current || !session.current || !video.current) {
			return;
		}

		// eslint-disable-next-line no-bitwise
		const resizedHeight = 640 >> 0;
		// eslint-disable-next-line no-bitwise
		const resizedWidth = 640 >> 0;

		const frameCanvas = document.createElement("canvas");
		frameCanvas.height = resizedHeight;
		frameCanvas.width = resizedWidth;

		const frameContext = frameCanvas.getContext("2d", {
			willReadFrequently: true,
		});
		if (!frameContext) {
			return;
		}

		// Draw video frame to canvas
		frameContext.drawImage(video.current, 0, 0, resizedWidth, resizedHeight);

		// Resized video frame
		const frame = frameContext.getImageData(0, 0, resizedWidth, resizedHeight).data;

		const r: number[] = [];
		const g: number[] = [];
		const b: number[] = [];
		for (let index = 0; index < frame.length; index += 4) {
			r.push(frame[index]! / 255);
			g.push(frame[index + 1]! / 255);
			b.push(frame[index + 2]! / 255);
		}

		const input = [...r, ...g, ...b];

		const inputShape = [1, 3, resizedWidth, resizedHeight];
		const inputTensor = new ort.Tensor(Float32Array.from(input), inputShape);

		const { output0 } = await session.current.net.run({
			// `images` is from `session.current.inputNames`
			images: inputTensor,
		});
		if (!output0) {
			return;
		}

		const config = new ort.Tensor(
			"float32",
			new Float32Array([
				50, // topk per class
				0.45, // iou threshold
				0.25, // score threshold
			]),
		);
		const { selected } = await session.current.nms.run({ detection: output0, config });
		if (!selected) {
			return;
		}

		const { data, dims } = selected;
		if (!data || dims.length < 3) {
			return;
		}

		context.current.save();
		context.current.clearRect(0, 0, canvas.current.width, canvas.current.height);

		const keypoints: [x: number, y: number, confidence: number][] = [];
		for (let i = 0; i < dims[1]!; i += 1) {
			const sliced = data.slice(i * dims[2]!, (i + 1) * dims[2]!);

			// Keypoints
			const kpts = sliced.slice(5);

			for (let j = 0; j < kpts.length; j += 3) {
				const [x, y, score] = kpts.slice(j, j + 3);
				keypoints.push([Number(x), Number(y), Number(score)]);
			}
		}

		// eslint-disable-next-line no-restricted-syntax
		for (const [x, y] of keypoints) {
			context.current.fillStyle = "white";

			const scaleX = canvas.current.width / 640;
			const scaleY = canvas.current.height / 640;

			const circle = new Path2D();
			circle.arc(x * scaleX, y * scaleY, 2, 0, 2 * Math.PI);

			context.current.fill(circle);
			context.current.stroke(circle);
		}

		context.current.restore();

		if (!video.current.paused) {
			raf.current = requestAnimationFrame(processVideo);
		}
	}, []);

	// Side Effects
	//

	// Setup ONNXRuntime
	useAsync(async () => {
		if (session.current) {
			return;
		}

		// TODO: Properly handle error by displaying a message to the user
		try {
			const [net, nms] = await Promise.all([
				ort.InferenceSession.create("/yolov8n-pose.onnx", {
					executionProviders: [
						{
							name: "wasm",
						},
					],
					executionMode: "parallel",
					graphOptimizationLevel: "all",
				}),
				ort.InferenceSession.create("/nms-yolov8-pose.onnx", {
					executionProviders: [
						{
							name: "wasm",
						},
					],
					executionMode: "parallel",
					graphOptimizationLevel: "all",
				}),
			]);
			session.current = { net, nms };

			raf.current = requestAnimationFrame(processVideo);
			toggleIsLoading(false);
		} catch (e) {
			console.error(e);
		}
	}, []);

	// Load video and setup canvas
	useEffect(() => {
		if (!canvas.current || !video.current) {
			return;
		}

		// Set references
		context.current = canvas.current.getContext("2d") ?? undefined;

		// Create event listener for video load that sets the canvas dimension
		video.current.addEventListener("loadeddata", loadVideo);
		// Create event listener and start detection
		video.current.addEventListener("play", processVideo);

		// Create event listener for window resize that sets the canvas dimension
		window.addEventListener("resize", loadVideo);

		// Cleanup
		// eslint-disable-next-line consistent-return
		return () => {
			video.current?.removeEventListener("loadeddata", loadVideo);
			video.current?.removeEventListener("play", processVideo);

			window.removeEventListener("resize", loadVideo);
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Actions
	//

	const forwardVideo = useCallback(() => {
		if (!video.current) {
			return;
		}

		video.current.currentTime += 10;
	}, []);

	const rewindVideo = useCallback(() => {
		if (!video.current) {
			return;
		}

		video.current.currentTime -= 10;
	}, []);

	const setCanvas = useCallback((ref: HTMLCanvasElement) => {
		canvas.current = ref;
	}, []);

	const setVideo = useCallback((ref: HTMLVideoElement) => {
		video.current = ref;
	}, []);

	const setVideoSrc = useCallback((url: string) => {
		if (!video.current) {
			return;
		}

		video.current.src = url;
	}, []);

	const setVideoVolume = useCallback((volume: number) => {
		if (!video.current) {
			return;
		}

		video.current.volume = volume;
	}, []);

	const toggleVideoPlayState = useCallback(() => {
		if (!video.current) {
			return;
		}

		if (video.current.paused) {
			video.current.play();
		} else {
			video.current.pause();
		}
	}, []);

	return [
		{
			isLoading,
			video,
		},
		{
			forwardVideo,
			rewindVideo,
			setCanvas,
			setVideo,
			setVideoSrc,
			setVideoVolume,
			toggleVideoPlayState,
		},
	];
}
