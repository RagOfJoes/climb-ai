//
//  EditorBetaView.swift
//  Noraa
//
//  Created by Raggy on 4/24/24.
//

import SwiftUI

struct EditorBetaView: View {
	@ObservedObject var editorVM: EditorViewModel
	@ObservedObject var playerVM: EditorPlayerViewModel
	
	var body: some View {
		GeometryReader { proxy in
			let betaX = proxy.size.width - playerVM.currentTime / playerVM.duration * proxy.size.width

			HStack {
				Text("BETA")
					.foregroundStyle(Color("Foreground"))
					.frame(width: .infinity, height: .infinity)
			}
			.frame(maxWidth: .infinity, maxHeight: .infinity)
			.clipShape(RoundedRectangle(cornerRadius: CGFloat(10)))
			.overlay(RoundedRectangle(cornerRadius: CGFloat(10)).stroke(Color("Surface"), lineWidth: 1))
			.position(CGPoint(x: betaX, y: proxy.size.height / 2))
		}
	}
}
