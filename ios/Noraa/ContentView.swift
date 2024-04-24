//
//	ContentView.swift
//	Norra
//
//	Created by Raggy on 4/17/24.
//

import SwiftUI

struct ContentView: View {
	var body: some View {
		EditorView(selectedVideoURL: Bundle.main.url(forResource: "IMG_2554", withExtension: "mov"))
	}
}

#Preview {
	ContentView()
}
