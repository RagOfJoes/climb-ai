// Get actual canvas dimension based on video aspect ratio
export function getCanvasDimension(video: HTMLVideoElement): { height: number; width: number } {
	// Set canvas size
	const aspectRatio = video.videoWidth / video.videoHeight;
	const width = video.clientHeight * aspectRatio;

	return { height: video.clientHeight, width };
}
