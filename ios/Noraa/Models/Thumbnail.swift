//
//  Thumbnail.swift
//  Noraa
//
//  Created by Raggy on 4/18/24.
//

import SwiftUI

struct Thumbnail: Identifiable {
		var id: UUID = UUID()
		var image: UIImage?
	
		init(image: UIImage? = nil) {
			self.image = image?.resize(to: CGSize(width: 250, height: 350))
		}
}
