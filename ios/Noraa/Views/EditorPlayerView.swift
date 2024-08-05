//
//  EditorPlayerView.swift
//  Noraa
//
//  Created by Raggy on 4/18/24.
//

import AVKit
import SwiftUI

struct EditorPlayerView: View {
	@ObservedObject var editorVM: EditorViewModel
	@ObservedObject var playerVM: EditorPlayerViewModel
	
	// Computed properties
//	var formattedCurrentTime: String {
//		let hours = Int(playerVM.currentTime / 3600)
//		let minutes = Int((playerVM.currentTime.truncatingRemainder(dividingBy: 3600)) / 60)
//		let seconds = Int((playerVM.currentTime.truncatingRemainder(dividingBy: 3600)).truncatingRemainder(dividingBy: 60))
//		let total = "\(String(format: "%02d", hours)):\(String(format: "%02d", minutes)):\(String(format: "%02d", seconds))"
//		
//		return total
//	}
//	var formattedDuration: String {
//		let hours = Int(playerVM.duration / 3600)
//		let minutes = Int((playerVM.duration.truncatingRemainder(dividingBy: 3600)) / 60)
//		let seconds = Int((playerVM.duration.truncatingRemainder(dividingBy: 3600)).truncatingRemainder(dividingBy: 60))
//		let total = "\(String(format: "%02d", hours)):\(String(format: "%02d", minutes)):\(String(format: "%02d", seconds))"
//		
//		return total
//	}

	var body: some View {
		VStack(spacing: 6) {
			ZStack(alignment: .bottom) {
				switch playerVM.loadState {
				case .failed:
					Text("Failed to open video")
				case .loading:
					ProgressView()
				case .unknown:
					Text("Select video")
				case .loaded:
					Group {
						if let video = editorVM.video {
							GeometryReader { proxy in
								CropView(videoSize: .init(width: video.size.width * 1, height: video.size.height * 1)) {
									ZStack {
										editorVM.frame.color
										
										ZStack {
											AVPlayerViewControllerRepresentable(player: playerVM.player)
										}
										.scaleEffect(1)
									}
								}
								.frame(maxWidth: /*@START_MENU_TOKEN@*/.infinity/*@END_MENU_TOKEN@*/, maxHeight: .infinity)
								.task {
									if editorVM.video == nil {
										return
									}
									
									guard let size = await editorVM.video!.asset.resize(to: proxy.size) else {
										return
									}
									
									editorVM.video!.size = size
								}
							}
						}
					}
				}
			}
			.frame(maxWidth: /*@START_MENU_TOKEN@*/.infinity/*@END_MENU_TOKEN@*/, maxHeight: .infinity)
			.padding(.vertical)
		}
	}
}

struct CropView<T: View>: View {
	@State var clipped: Bool = false
	@State private var position: CGPoint = .zero
	@State var size: CGSize = .zero
	
	let videoSize: CGSize
	
	@ViewBuilder
	var view: () -> T
	
	var body: some View {
		ZStack {
			view()
		}
		.frame(width: videoSize.width, height: videoSize.height)
		.rotation3DEffect(.degrees(0), axis: (x: 0, y: 1, z: 0))
		.rotationEffect(.degrees(0))
	}
}

#Preview {
	EditorPlayerView(
		editorVM: EditorViewModel(),
		playerVM: EditorPlayerViewModel()
	)
}
