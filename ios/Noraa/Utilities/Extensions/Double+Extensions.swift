//
//  Double+Extensions.swift
//  Noraa
//
//  Created by Raggy on 4/29/24.
//

import Foundation

extension Double {
	func roundToDecimal(_ fractionDigits: Int) -> Double {
		let multiplier = pow(10, Double(fractionDigits))
		
		return Darwin.round(self * multiplier) / multiplier
	}
}
