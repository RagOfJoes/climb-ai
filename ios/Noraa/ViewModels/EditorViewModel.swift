//
//  EditorViewModel.swift
//  Noraa
//
//  Created by Raggy on 4/18/24.
//

import AVKit
import SwiftUI

class EditorViewModel: ObservableObject {
	@Published var container: CGSize?
	@Published var frame: VideoFrame = VideoFrame()
	@Published var video: Video?
}
