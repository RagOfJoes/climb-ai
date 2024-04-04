import { useEffect, useState } from "react";

import { useSearchParams } from "@remix-run/react";
import { Pause, Play, RotateCcw, RotateCw, Volume, Volume1, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Slider } from "@/components/slider";
import { Textarea } from "@/components/textarea";
import { usePose } from "@/hooks/use-pose";

export default function Index() {
	const [
		{ isLoading, video },
		{ forwardVideo, rewindVideo, setCanvas, setVideo, setVideoSrc, toggleVideoPlayState },
	] = usePose();
	const [searchParams] = useSearchParams();

	const [isPaused, toggleIsPaused] = useState(true);
	const [volume, setVolume] = useState(0);

	// TODO: Update this to pull from user upload
	useEffect(() => {
		const url = searchParams.get("video");
		if (!url) {
			return;
		}

		setVideoSrc(url);
	}, []);

	useEffect(() => {
		if (!video.current) {
			return;
		}

		setVolume(video.current.volume);
	}, [video.current]);

	return (
		<main className="mx-auto max-w-screen-lg">
			<div className="relative grid h-screen grid-cols-8 grid-rows-8 gap-4 p-4">
				<div className="col-span-2 row-span-6 flex flex-col gap-4 rounded-md border border-muted bg-card p-4">
					<h3 className="text-lg font-medium">Metadata</h3>

					<div className="grid w-full max-w-sm items-center gap-1.5">
						<Label htmlFor="title">Title</Label>
						<Input id="title" placeholder="Add title..." />
					</div>

					<div className="grid w-full max-w-sm items-center gap-1.5">
						<Label htmlFor="description">Description</Label>
						<Textarea className="resize-none" id="description" placeholder="Add description..." />
					</div>
				</div>

				<div className="relative col-span-6 row-span-6">
					<canvas
						className="absolute left-1/2 top-0 z-0 -translate-x-1/2 touch-none select-none"
						ref={(el) => {
							if (!el) {
								return;
							}

							setCanvas(el);
						}}
					/>
					<video
						className="z-10 h-full w-full bg-background"
						disablePictureInPicture
						onPause={() => {
							toggleIsPaused(true);
						}}
						onPlay={() => {
							toggleIsPaused(false);
						}}
						playsInline
						ref={(el) => {
							if (!el) {
								return;
							}

							setVideo(el);
						}}
					/>
				</div>

				<div className="col-span-8 row-span-2 rounded-md border border-muted p-2">
					<div className="flex gap-2">
						<Button
							aria-label="Rewind 10 seconds"
							disabled={isLoading}
							onClick={() => {
								rewindVideo();
							}}
							size="icon"
							variant="ghost"
						>
							<RotateCcw className="h-4 w-4" />
						</Button>

						<Button
							aria-label={`${isPaused ? "Play" : "Pause"} video`}
							disabled={isLoading}
							onClick={() => {
								toggleVideoPlayState();
							}}
							size="icon"
							variant="ghost"
						>
							{isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
						</Button>

						<Button
							aria-label="Skip 10 seconds"
							disabled={isLoading}
							onClick={() => {
								forwardVideo();
							}}
							size="icon"
							variant="ghost"
						>
							<RotateCw className="h-4 w-4" />
						</Button>

						<div className="flex w-full gap-2">
							<Button
								aria-label="Volume"
								disabled={isLoading}
								onClick={() => {
									if (!video.current) {
										return;
									}

									setVolume(0);
									video.current.volume = 0;
								}}
								size="icon"
								variant="ghost"
							>
								{volume === 0 && <VolumeX className="h-4 w-4" />}

								{volume > 0 && volume < 0.5 && <Volume className="h-4 w-4" />}
								{volume > 0.5 && volume < 0.75 && <Volume1 className="h-4 w-4" />}
								{volume > 0.75 && <Volume2 className="h-4 w-4" />}
							</Button>

							<Slider
								className="w-full"
								disabled={isLoading}
								max={100}
								min={0}
								onValueChange={(newValue) => {
									if (!video.current) {
										return;
									}

									video.current.volume = newValue[0]! / 100;
									setVolume(newValue[0]! / 100);
								}}
								step={1}
								value={[volume * 100]}
							/>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
