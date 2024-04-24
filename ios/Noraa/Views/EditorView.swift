//
//  EditorView.swift
//  Noraa
//
//  Created by Raggy on 4/17/24.
//

import AVKit
import SwiftUI

struct EditorView: View {
	@StateObject var editorVM = EditorViewModel()
	@StateObject var playerVM = EditorPlayerViewModel()
	
	var selectedVideoURL: URL?
	
	// Computed properties
	var formattedCurrentTime: String {
		let hours = Int(playerVM.currentTime / 3600)
		let minutes = Int((playerVM.currentTime.truncatingRemainder(dividingBy: 3600)) / 60)
		let seconds = Int((playerVM.currentTime.truncatingRemainder(dividingBy: 3600)).truncatingRemainder(dividingBy: 60))
		let total = "\(String(format: "%02d", hours)):\(String(format: "%02d", minutes)):\(String(format: "%02d", seconds))"
		
		return total
	}
	var formattedDuration: String {
		let hours = Int(playerVM.duration / 3600)
		let minutes = Int((playerVM.duration.truncatingRemainder(dividingBy: 3600)) / 60)
		let seconds = Int((playerVM.duration.truncatingRemainder(dividingBy: 3600)).truncatingRemainder(dividingBy: 60))
		let total = "\(String(format: "%02d", hours)):\(String(format: "%02d", minutes)):\(String(format: "%02d", seconds))"
		
		return total
	}
	
	var body: some View {
		ZStack {
			GeometryReader { proxy in
				VStack(spacing: 0) {
					// MARK: Header view
					HStack {}
						.frame(maxWidth: .infinity)
						.background(.black)
					
					// MARK: Player view
					EditorPlayerView(editorVM: editorVM, playerVM: playerVM)
						.frame(height: proxy.size.height / 1.65)
						.overlay(
							HStack(spacing: 0) {
								Text(formattedCurrentTime)
									.font(Font.custom("GOST type B", size: 14))
									.foregroundStyle(Color("Background"))
								
								Text(" / ")
									.font(Font.custom("GOST type B", size: 10))
									.foregroundStyle(Color("Background"))
								
								Text(formattedDuration)
									.font(Font.custom("GOST type B", size: 14))
									.foregroundStyle(Color("Background"))
							}
								.padding(.horizontal, 8)
								.padding(.vertical, 2)
								.background(Color("Surface").opacity(0.6))
								.clipShape(RoundedRectangle(cornerRadius: 8))
								.padding(.vertical),
							alignment: .bottom
						)
					
					// MARK: Timeline view
					EditorTimelineView(editorVM: editorVM, playerVM: playerVM)
					
					// MARK: Add move view
					Button(action: {}) {
						Label(
							title: {
								Text("ADD MOVE")
									.font(Font.custom("GOST type B", size: 14))
									.foregroundStyle(Color("Foreground"))
							},
							icon: {
								Image(systemName: "circle.fill")
									.foregroundStyle(Color("Foreground"))
									.imageScale(.small)
							}
						)
						
						Spacer()
						Image(systemName: "plus")
							.foregroundStyle(Color("Foreground"))
							.imageScale(.small)
					}
					.padding(.horizontal)
					.frame(maxWidth: .infinity, maxHeight: 50)
					.background(Color("Primary"))
					.foregroundStyle(Color("Foreground"))
					
					// MARK: Controls view
					EditorPlayerControlView(editorVM: editorVM, playerVM: playerVM)
					
					// MARK: Tools view
				}
				.task {
					guard let selectedVideoURL else {
						return
					}
					
					let container = proxy.size
					
					var selectedVideo = Video.init(url: selectedVideoURL)
					// TODO: Handle error
					guard let duration = try? await selectedVideo.rangeDuration else {
						return
					}
					// TODO: Handle error
					if let thumbnails = try? await selectedVideo.getThumbnails(container) {
						selectedVideo.thumbnails = thumbnails
					}
					
					playerVM.loadState = .loaded(selectedVideoURL, duration.upperBound)
					
					editorVM.container = container
					editorVM.video = selectedVideo
				}
			}
		}
		.frame(maxWidth: .infinity, maxHeight: .infinity)
		.background(Color("Background"))
		.navigationBarBackButtonHidden(true)
		.toolbar(.hidden)
	}
}

#Preview {
	EditorView(selectedVideoURL: Bundle.main.url(forResource: "IMG_2554", withExtension: "mov"))
}
