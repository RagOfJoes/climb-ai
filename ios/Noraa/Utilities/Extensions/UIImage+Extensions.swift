//
//  UIImage+Extensions.swift
//  Noraa
//
//  Created by Raggy on 4/18/24.
//

import Foundation
import SwiftUI

extension UIImage {
	/// Returns a resized version of the image
	func resize(to: CGSize, scale: CGFloat = 1.0) -> UIImage {
		let format = UIGraphicsImageRendererFormat.default()
		format.scale = scale
		
		let renderer = UIGraphicsImageRenderer(size: size, format: format)
		return renderer.image { _ in
			self.draw(in: CGRect(origin: .zero, size: size))
		}
	}
}
