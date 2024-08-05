//
//  EditorSeekerView.swift
//  Noraa
//
//  Created by Raggy on 4/24/24.
//

import SwiftUI

struct EditorSeekerView: View {
	@ObservedObject var editorVM: EditorViewModel
	@ObservedObject var playerVM: EditorPlayerViewModel
	
	var body: some View {
		GeometryReader { proxy in
			Group {
				let capsuleWidth: Double = 3
				
				Capsule()
					.fill(Color("Primary"))
					.padding(.vertical, 8)
					.frame(width: capsuleWidth, height: proxy.size.height)
			}
			.frame(maxWidth: .infinity, maxHeight: .infinity)
			.contentShape(Rectangle())
			.gesture(
				DragGesture(minimumDistance: 1)
					.onChanged { gesture in
						playerVM.onDragSeek(gesture: gesture, container: proxy)
					}
					.onEnded { gesture in
						playerVM.onDragSeekEnd(gesture: gesture, container: proxy)
					}
			)
		}
	}
}
