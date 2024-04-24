//
//  Video.swift
//  Noraa
//
//  Created by Raggy on 4/18/24.
//

import AVKit
import SwiftUI

struct VideoFrame {
	var color: Color = .white
	var scaleValue: Double = 0
	
	var isActive: Bool {
		return scaleValue > 0
	}
	
	var scale: Double {
		return 1 - scaleValue
	}
	
	mutating func reset() {
		color = .white
		scaleValue = 0
	}
}

struct Video: Identifiable {
	let asset: AVAsset
	
	var id: UUID = UUID()
	var url: URL
	
	var rate: Float = 1.0
	var size: CGSize = .zero
	var thumbnails: [Thumbnail] = [Thumbnail]()
	var volume: Float = 1.0
	
	var geometrySize: CGSize = .zero
	
	var frame: VideoFrame? = nil
	
	var rangeDuration: ClosedRange<Double> {
		get async throws {
			let duration = try await asset.load(.duration)
			
			return 0...duration.seconds
		}
	}
	
	init(url: URL) {
		self.url = url
		self.asset = AVAsset(url: url)
	}
	
	func getThumbnails(_ container: CGSize) async throws -> [Thumbnail] {
		let generator = AVAssetImageGenerator(asset: asset)
		generator.requestedTimeToleranceBefore = .zero
		generator.requestedTimeToleranceAfter = CMTime(seconds: 3, preferredTimescale: 600)
		
		let duration = try await asset.load(.duration).seconds
		
		// TODO: Play around with this value
		let count = Int(ceil(duration / 8.0))
		var times: [CMTime] = [CMTime]()
		for i in 0..<count {
			times.append(CMTime(seconds: Double(i) * 8.0, preferredTimescale: 600))
		}
		
		var thumbnails: [Thumbnail] = [Thumbnail]()
		for await result in generator.images(for: times) {
			switch result {
			case .failure(requestedTime: _, error: _):
				// TODO: Create placeholder
				break
			case .success(requestedTime: _, image: let image, actualTime: _):
				let uiImage = UIImage(cgImage: image)
				// TODO: Create placeholder
				guard let imageData = uiImage.jpegData(compressionQuality: 0.5), let compressedUIImage = UIImage(data: imageData) else {
					break
				}
				
				let thumbnail = Thumbnail(image: compressedUIImage)
				thumbnails.append(thumbnail)
			}
		}
		
		return thumbnails
	}
}
