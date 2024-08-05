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
						.frame(height: proxy.size.height / 1.4)
					
					// MARK: Controls view
					EditorPlayerControlView(editorVM: editorVM, playerVM: playerVM)
					
					// MARK: Timeline view
					ZStack {
						VStack(spacing: 8) {
							EditorTimelineView(editorVM: editorVM, playerVM: playerVM)
							
							// TODO: Implement this
							EditorBetaView(editorVM: editorVM, playerVM: playerVM)
						}
						.padding(.vertical)
						
						EditorSeekerView(editorVM: editorVM, playerVM: playerVM)
					}
					
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
