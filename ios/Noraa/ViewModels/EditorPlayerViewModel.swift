//
//  EditorPlayerViewModel.swift
//  Noraa
//
//  Created by Raggy on 4/18/24.
//

import AVKit
import Combine
import PhotosUI
import SwiftUI

enum LoadState: Equatable, Identifiable {
	case failed
	case loaded(URL, Double)
	case loading
	// Initial state
	case unknown
	
	var id: Int{
		switch self {
		case .unknown: 
			return 0
		case .loading:
			return 1
		case .loaded:
			return 2
		case .failed: 
			return 3
		}
	}
}

enum ScrubState {
	case ended(Double)
	case reset
	case started
}

final class EditorPlayerViewModel: ObservableObject {
	@Published var currentTime: Double = .zero
	@Published var isPlaying: Bool = false
	@Published var loadState: LoadState = .unknown
	@Published private(set) var player: AVPlayer = AVPlayer()
	
	private var cancellable: Set<AnyCancellable> = Set<AnyCancellable>()
	private var rangeDuration: ClosedRange<Double>?
	private var timeObserver: Any?
	
	var duration: Double {
		let lower = rangeDuration?.lowerBound ?? 0
		let upper = rangeDuration?.upperBound ?? 1
		
		return upper - lower
	}

	var scrub: ScrubState = .reset {
		didSet {
			switch scrub {
			case .ended(let time):
				self.player.pause()
				self.seek(CMTime(seconds: time, preferredTimescale: 600).seconds)
			default:
				break
			}
		}
	}
	
	deinit {
		if let timeObserver = timeObserver {
			player.removeTimeObserver(timeObserver)
		}
	}
	
	init() {
		$loadState
			.dropFirst()
			.receive(on: DispatchQueue.main)
			.sink { [weak self] ls in
				guard let self else {
					return
				}
				
				switch ls {
				case .loaded(let url, let duration):
					if self.isPlaying {
						self.player.pause()
					}
					
					self.player = AVPlayer(url: url)
					self.rangeDuration = 0...duration
					
					self.publishVideoStatus()
				case .failed, .loading, .unknown:
					break
				}
			}
			.store(in: &cancellable)
	}
	
	private func publishVideoStatus() {
		player.publisher(for: \.timeControlStatus)
			.sink { [weak self] status in
				guard let self else {
					return
				}
				
				switch status {
				case .paused:
					self.isPlaying = false
				case .playing:
					self.isPlaying = true
					self.startTimer()
				case .waitingToPlayAtSpecifiedRate:
					break
				default:
					break
				}
			}
			.store(in: &cancellable)
	}
	
	private func startTimer() {
		let interval = CMTimeMake(value: 1, timescale: 10)
		
		timeObserver = player.addPeriodicTimeObserver(forInterval: interval, queue: .main) { [weak self] time in
			guard let self else {
				return
			}
			
			if !self.isPlaying {
				return
			}
			
			let current = time.seconds
			if let rangeDuration, current >= rangeDuration.upperBound {
				self.pause()
			}
			
			switch scrub {
			case .ended:
				self.scrub = .reset
			case .reset:
				self.currentTime = current
			case .started:
				break
			}
		}
	}
}

// MARK: Player actions
extension EditorPlayerViewModel {
	private func pause() {
		if !isPlaying {
			return
		}
		
		player.pause()
	}
	
	private func play(_ rate: Float?) {
		let audio = AVAudioSession.sharedInstance()
		do {
			try audio.setCategory(.playback, mode: .default)
			try audio.overrideOutputAudioPort(.none)
			try audio.setActive(true)
		} catch let error as NSError {
			print("Error \(error.localizedDescription)")
		}
		
		player.play()
		
		if let rate {
			player.rate = rate
		}
		
		if let rangeDuration, player.currentItem?.duration.seconds ?? 0 >= rangeDuration.upperBound {
			NotificationCenter.default.addObserver(forName: NSNotification.Name.AVPlayerItemDidPlayToEndTime, object: player.currentItem, queue: .main) { _ in
				self.seek(0)
			}
		}
	}
	
	func seek(_ to: Double) {
		var seconds: Double = to
		if to <= 0 {
			seconds = 0
		} else if to >= duration {
			seconds = duration
		}

		player.seek(to: CMTime(seconds: seconds, preferredTimescale: 600)) { isComplate in
			if !isComplate {
				return
			}
			
			self.currentTime = seconds
		}
	}
	
	func toggle(_ video: Video) {
		isPlaying ? pause() : play(video.rate)
	}
}
