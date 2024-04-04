import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

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
		toggleVideoPlayState: () => void;
	},
];

// Landmark visibility threshold
// TODO: Play around with this value
const MIN_VISIBILITY = 0.3;

// Connections between landmarks
const POSE_CONNECTIONS = [
	[11, 12],
	[11, 13],
	[13, 15],
	[15, 17],
	[15, 19],
	[15, 21],
	[17, 19],
	[12, 14],
	[14, 16],
	[16, 18],
	[16, 20],
	[16, 22],
	[18, 20],
	[11, 23],
	[12, 24],
	[23, 24],
	[23, 25],
	[24, 26],
	[25, 27],
	[26, 28],
	[27, 29],
	[28, 30],
	[29, 31],
	[30, 32],
	[27, 31],
	[28, 32],
].map((connection) => ({ start: connection[0]!, end: connection[1]! }));

// Landmark indices for left side of the body
// Ref: https://developers.google.com/mediapipe/solutions/vision/pose_landmarker/#pose_landmarker_model
const POSE_LANDMARKER_LEFT = [27, 13, 31, 29, 23, 19, 25, 17, 11, 21, 15];
// Landmark indices for right side of the body
// Ref: https://developers.google.com/mediapipe/solutions/vision/pose_landmarker/#pose_landmarker_model
const POSE_LANDMARKER_RIGHT = [28, 14, 32, 30, 24, 20, 26, 18, 12, 22, 16];

// Hook for pose detection. Requires a canvas and video element to be set
export function usePose(): UsePoseReturn {
	const canvas = useRef<HTMLCanvasElement>();
	const context = useRef<CanvasRenderingContext2D>();
	const landmarker = useRef<PoseLandmarker>();
	const raf = useRef<number>();
	const video = useRef<HTMLVideoElement>();

	const [isLoading, toggleIsLoading] = useState(true);

	// Sets canvas dimension
	const loadVideo = () => {
		if (!canvas.current || !video.current) {
			return;
		}

		const { height, width } = getCanvasDimension(video.current);
		canvas.current.width = width;
		canvas.current.height = height;
	};

	// Process video frames
	const processVideo = useCallback(async () => {
		// Typechecks
		if (!canvas.current || !context.current || !landmarker.current || !video.current) {
			return;
		}

		const height = canvas.current.height;
		const width = canvas.current.width;

		// Detect landmarks for video frame
		landmarker.current.detectForVideo(video.current, performance.now(), (result) => {
			// Typechecks
			if (!canvas.current || !context.current) {
				return;
			}

			// Clear canvas
			context.current.save();
			context.current.clearRect(0, 0, width, height);

			// Iterate over detected landmarks
			result.landmarks.forEach((landmarks) => {
				if (!context.current) {
					return;
				}

				// Draw connections
				// NOTE: The order matters here since we want the landmark dots to be above the connections
				POSE_CONNECTIONS.forEach((connection) => {
					if (!canvas.current || !context.current) {
						return;
					}

					const from = landmarks[connection.start];
					const to = landmarks[connection.end];

					// Skip if visibility is below threshold
					if (
						!from ||
						!to ||
						from.visibility <= MIN_VISIBILITY ||
						to.visibility <= MIN_VISIBILITY
					) {
						return;
					}

					// Set proper styles for connections
					// TODO: Play around with the colors
					context.current.lineWidth = 2;
					context.current.strokeStyle = "white";

					// Draw line
					const fromX = from.x * width;
					const fromY = from.y * height;

					const toX = to.x * width;
					const toY = to.y * height;

					context.current.beginPath();
					context.current.moveTo(fromX, fromY);
					context.current.lineTo(toX, toY);
					context.current.stroke();
				});

				// Iterate over landmarks and draw dots on canvas
				landmarks.forEach((landmark, index) => {
					// Skip if landmark is above the shoulders and visibility is below threshold
					if (
						!canvas.current ||
						!context.current ||
						!video.current ||
						index <= 10 ||
						landmark.visibility <= MIN_VISIBILITY
					) {
						return;
					}

					// Set proper styles for landmarks depending on the side of the body
					// TODO: Play around with the colors
					if (POSE_LANDMARKER_LEFT.includes(index)) {
						context.current.fillStyle = "rgb(255, 138, 0)";
						context.current.strokeStyle = "rgb(255, 138, 0)";
					} else if (POSE_LANDMARKER_RIGHT.includes(index)) {
						context.current.fillStyle = "rgb(0,217,231)";
						context.current.strokeStyle = "rgb(0,217,231)";
					}

					// Draw dot
					const x = landmark.x * width;
					const y = landmark.y * height;

					const circle = new Path2D();
					circle.arc(x, y, 2, 0, 2 * Math.PI);

					context.current.fill(circle);
					context.current.stroke(circle);
				});
			});

			context.current.restore();
		});

		if (!video.current.paused) {
			raf.current = requestAnimationFrame(processVideo);
		}
	}, []);

	// Create and configure model
	useAsync(async () => {
		const vision = await FilesetResolver.forVisionTasks("/wasm");
		landmarker.current = await PoseLandmarker.createFromOptions(vision, {
			baseOptions: {
				delegate: "GPU",
				modelAssetPath: "/pose_landmarker_heavy.task",
			},
			minPoseDetectionConfidence: 0.3,
			minPosePresenceConfidence: 0.5,
			minTrackingConfidence: 0.5,
			runningMode: "VIDEO",
		});

		raf.current = requestAnimationFrame(processVideo);
		toggleIsLoading(false);

		// Cleanup
		return () => {
			landmarker.current?.close();

			if (!raf.current) {
				return;
			}

			cancelAnimationFrame(raf.current);
		};
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

		// Cleanup
		// eslint-disable-next-line consistent-return
		return () => {
			video.current?.removeEventListener("loadeddata", loadVideo);
			video.current?.removeEventListener("play", processVideo);
		};
	}, [canvas.current, landmarker.current, video.current]);

	// Actions
	//

	const forwardVideo = useCallback(() => {
		if (!video.current) {
			return;
		}

		video.current.currentTime += 10;
	}, [video.current]);

	const rewindVideo = useCallback(() => {
		if (!video.current) {
			return;
		}

		video.current.currentTime -= 10;
	}, [video.current]);

	const setCanvas = useCallback((ref: HTMLCanvasElement) => {
		canvas.current = ref;
	}, []);

	const setVideo = useCallback((ref: HTMLVideoElement) => {
		video.current = ref;
	}, []);

	const setVideoSrc = useCallback(
		(url: string) => {
			if (!video.current) {
				return;
			}

			video.current.src = url;
		},
		[video.current],
	);

	const toggleVideo = useCallback(() => {
		if (!video.current) {
			return;
		}

		if (video.current.paused) {
			video.current.play();
		} else {
			video.current.pause();
		}
	}, [video.current]);

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
			toggleVideoPlayState: toggleVideo,
		},
	];
}
