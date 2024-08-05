//
//  EditorPlayerControlView.swift
//  Noraa
//
//  Created by Raggy on 4/22/24.
//

import SwiftUI

struct EditorPlayerControlView: View {
	@ObservedObject var editorVM: EditorViewModel
	@ObservedObject var playerVM: EditorPlayerViewModel
	
	var isBackwardSeekDisabled: Bool {
		editorVM.video == nil || playerVM.currentTime == 0
	}
	var isForwardSeekDisabled: Bool {
		editorVM.video == nil || playerVM.currentTime == playerVM.duration
	}
	var isPlayDisabled: Bool {
		editorVM.video == nil
	}
	
	var body: some View {
		HStack(alignment: .center) {
//			Button(action: {
//				playerVM.seek(playerVM.currentTime - 10)
//			}) {
//				Image(systemName: "gobackward.10")
//					.imageScale(.medium)
//			}
//			.disabled(isBackwardSeekDisabled)
//			.opacity(isBackwardSeekDisabled ? 0.4 : 1)
//
//			Spacer()
			Button(action: {
				guard let video = editorVM.video else {
					return
				}
				
				playerVM.toggle(video)
			}) {
				Image(systemName: playerVM.isPlaying ? "pause.fill" : "play.fill")
					.imageScale(.medium)
			}
			.disabled(isPlayDisabled)
			.opacity(isPlayDisabled ? 0.4 : 1)
			
//			Spacer()
//			Button(action: {
//				playerVM.seek(playerVM.currentTime + 10)
//			}) {
//				Image(systemName: "goforward.10")
//					.imageScale(.medium)
//			}
//			.disabled(isForwardSeekDisabled)
//			.opacity(isForwardSeekDisabled ? 0.4 : 1)
		}
		.padding(.horizontal)
		.foregroundStyle(Color("Foreground"))
	}
}
