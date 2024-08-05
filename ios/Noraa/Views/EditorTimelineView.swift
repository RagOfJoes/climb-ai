//
//  EditorTimelineView.swift
//  Noraa
//
//  Created by Raggy on 4/23/24.
//

import SwiftUI

struct EditorTimelineView: View {
	@ObservedObject var editorVM: EditorViewModel
	@ObservedObject var playerVM: EditorPlayerViewModel
	
	var body: some View {
		GeometryReader { proxy in
			let timelineX = proxy.size.width - playerVM.currentTime / playerVM.duration * proxy.size.width
			
			if let video = editorVM.video {
				HStack(alignment: .center, spacing: 0) {
					ForEach(video.thumbnails) { thumbnail in
						if let image = thumbnail.image {
							Image(uiImage: image)
								.resizable()
								.aspectRatio(contentMode: .fill)
								.frame(width: proxy.size.width / CGFloat(video.thumbnails.count), height: proxy.size.height) .clipped()
						}
					}
				}
				.clipShape(RoundedRectangle(cornerRadius: CGFloat(10)))
				.frame(maxWidth: .infinity, maxHeight: .infinity)
				.position(CGPoint(x: timelineX, y: proxy.size.height / 2))
			}
		}
	}
}
