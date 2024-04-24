//
//  AVAsset+Extensions.swift
//  Noraa
//
//  Created by Raggy on 4/20/24.
//

import AVKit
import Foundation

extension AVAsset {
	func getNaturalSize() async -> CGSize? {
		guard let tracks = try? await loadTracks(withMediaType: .video) else {
			return nil
		}
		guard let track = tracks.first else {
			return nil
		}
		guard let size = try? await track.load(.naturalSize) else {
			return nil
		}
		
		return size
	}
	
	func resize(to: CGSize) async -> CGSize? {
		guard let naturalSize = await self.getNaturalSize() else {
			return nil
		}
		
		let aspectRatio = naturalSize.width / naturalSize.height
		
		var videoSize = to
		if naturalSize.height > naturalSize.width {
			videoSize = CGSize(width: videoSize.height * aspectRatio, height: videoSize.height)
		} else {
			videoSize = CGSize(width: videoSize.width, height: videoSize.width / aspectRatio)
		}
		
		return videoSize
	}
}
