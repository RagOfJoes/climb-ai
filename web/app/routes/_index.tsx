import { usePose } from "@/hooks/use-pose";

export default function Index() {
	const { canvasRef, videoRef } = usePose();

	return (
		<main className="mx-auto max-w-screen-md px-5">
			<div className="relative">
				<canvas
					className="absolute left-0 top-0 z-0 h-full w-full touch-none select-none"
					ref={(el) => {
						if (!el) {
							return;
						}

						canvasRef.current = el;
					}}
				/>
				<video
					className="z-10"
					autoPlay
					ref={(el) => {
						if (!el) {
							return;
						}

						videoRef.current = el;
					}}
					// src="/IMG_2516.mov"
					src="/IMG_2554.mov"
					height={720}
					width={1280}
				/>
			</div>
		</main>
	);
}
