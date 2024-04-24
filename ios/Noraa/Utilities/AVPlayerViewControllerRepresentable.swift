//
//  AVPlayerViewControllerRepresentable.swift
//  Noraa
//
//  Created by Raggy on 4/18/24.
//

import AVKit
import SwiftUI

struct AVPlayerViewControllerRepresentable: UIViewControllerRepresentable {
	var player: AVPlayer
	
	func makeUIViewController(context: Context) -> AVPlayerViewController {
		let view = AVPlayerViewController()
		view.player = player
		view.showsPlaybackControls = false
		view.videoGravity = .resizeAspectFill
		
		return view
	}
	
	func updateUIViewController(_ uiViewController: AVPlayerViewController, context: Context) {
		uiViewController.player = player
	}
}
