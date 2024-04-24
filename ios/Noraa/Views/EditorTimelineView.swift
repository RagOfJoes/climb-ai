//
//  EditorTimelineView.swift
//  Noraa
//
//  Created by Raggy on 4/23/24.
//

import SwiftUI

struct EditorTimelineView: View {
	@StateObject var editorVM = EditorViewModel()
	@StateObject var playerVM = EditorPlayerViewModel()
	
	var body: some View {
		Divider()
			.frame(maxWidth: .infinity, maxHeight: 0.4)
			.background(Color("Surface"))
		
		HStack(spacing: 0) {
			VStack(spacing: 0) {
				HStack {
					Image(systemName: "film")
						.foregroundStyle(Color("Foreground"))
						.imageScale(.small)
					Text("MEDIA")
						.font(Font.custom("GOST type B", size: 14))
						.foregroundStyle(Color("Foreground"))
				}
				.frame(maxWidth: .infinity, maxHeight: .infinity)
				.padding(.horizontal)
				
				Divider()
					.frame(maxWidth: .infinity, maxHeight: 0.4)
					.background(Color("Surface"))
				
				HStack {
					Image(systemName: "point.topleft.down.to.point.bottomright.curvepath.fill")
						.foregroundStyle(Color("Foreground"))
						.imageScale(.small)
					Text("BETA")
						.font(Font.custom("GOST type B", size: 14))
						.foregroundStyle(Color("Foreground"))
				}
				.frame(maxWidth: .infinity, maxHeight: .infinity)
				.padding(.horizontal)
			}
			.fixedSize(horizontal: /*@START_MENU_TOKEN@*/true/*@END_MENU_TOKEN@*/, vertical: false)
			
			VStack(spacing: 0) {
				GeometryReader { proxy in
					ZStack(alignment: Alignment(horizontal: .leading, vertical: .center)) {
						if let video = editorVM.video {
							HStack( spacing: 0) {
								ForEach(video.thumbnails) { thumbnail in
									if let image = thumbnail.image {
										Image(uiImage: image)
											.resizable()
											.aspectRatio(contentMode: .fill)
											.frame(width: proxy.size.width / CGFloat(video.thumbnails.count), height: proxy.size.height * 0.65)
											.clipped()
									}
								}
							}
						}
					}
					.frame(maxWidth: .infinity, maxHeight: .infinity)
					.background(Color("Secondary"))
				}
				
				Divider()
					.frame(maxWidth: .infinity, maxHeight: 0.4)
					.background(Color("Surface"))
				
				// TODO: Implement this
				HStack {
					Text("NO BETA")
						.font(Font.custom("GOST type B", size: 14))
						.foregroundStyle(Color("Foreground"))
				}
				.frame(maxWidth: .infinity, maxHeight: .infinity)
				.background(Color("Tertiary"))
			}
			.frame(maxWidth: .infinity, maxHeight: .infinity)
		}
	}
}
