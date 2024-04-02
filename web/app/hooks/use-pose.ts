import { useCallback, useEffect, useRef, useState } from "react";

import { DrawingUtils, FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

import { useAsync } from "./use-async";

// const VIDEO_HEIGHT = 720;
// const VIDEO_WIDTH = 1280;

export function usePose() {
	const canvasRef = useRef<HTMLCanvasElement>();
	const contextRef = useRef<CanvasRenderingContext2D>();
	const draw = useRef<DrawingUtils>();
	const landmarker = useRef<PoseLandmarker>();
	const videoRef = useRef<HTMLVideoElement>();

	const [lastVideoFrame, setLastVideoFrame] = useState(0);

	const processVideo = useCallback(async () => {
		// Typechecks
		if (!canvasRef.current || !contextRef.current || !landmarker.current || !videoRef.current) {
			return;
		}

		if (videoRef.current.paused) {
			return;
		}

		// Set canvas size
		canvasRef.current.width = 1280;
		canvasRef.current.height = 720;

		// Set video size
		// videoRef.current.width = VIDEO_WIDTH;
		// videoRef.current.height = VIDEO_HEIGHT;

		// Get current time in video
		const now = performance.now();

		// Process individual frame in video
		if (lastVideoFrame !== videoRef.current.currentTime) {
			setLastVideoFrame(videoRef.current.currentTime);

			landmarker.current.detectForVideo(videoRef.current, now, (result) => {
				if (!canvasRef.current || !contextRef.current || !draw.current) {
					return;
				}

				contextRef.current.save();
				contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

				// eslint-disable-next-line no-restricted-syntax
				for (const landmarks of result.landmarks) {
					// draw.current.drawLandmarks(landmarks, {
					// 	// color: (data) => {
					// 	//   if (!data.index) {
					// 	//     return "white";
					// 	//   }
					// 	//
					// 	//   return [""];
					// 	// },
					// 	fillColor: "white",
					// 	radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
					// });
					draw.current.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS);
				}

				contextRef.current.restore();
			});
		}

		requestAnimationFrame(() => {
			processVideo();
		});
	}, []);

	// Create and configure task
	useAsync(async () => {
		const vision = await FilesetResolver.forVisionTasks("/wasm");
		landmarker.current = await PoseLandmarker.createFromOptions(vision, {
			baseOptions: {
				delegate: "GPU",
				modelAssetPath: "/pose_landmarker_full.task",
			},
			// minPosePresenceConfidence: 0.92,
			// minPoseDetectionConfidence: 0.9,
			// canvas: canvasRef.current,
			// numPoses: 5,
			runningMode: "VIDEO",
		});
	}, []);

	// Load video and setup canvas
	useEffect(() => {
		if (!canvasRef.current || !videoRef.current) {
			return;
		}

		// Set references
		contextRef.current = canvasRef.current.getContext("2d") ?? undefined;
		draw.current = new DrawingUtils(contextRef.current!, undefined);

		// Create event listener and start detection
		videoRef.current.addEventListener("play", processVideo);
	}, [canvasRef.current, landmarker.current, videoRef.current]);

	return { canvasRef, videoRef };
}
