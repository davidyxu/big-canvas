$(function() {
	$('#size-picker').change(function() {
		BC.style.width = $('#size-picker').val();
	});

	$('#size-picker').keypress(Helper.setSize);

	$('#brush-picker').change(function() {
		BC.style.lineCap = $('#brush-picker').val();
		if (BC.style.lineCap === "round") {
			BC.style.lineJoin = "round";
		} else {
			BC.style.lineJoin = "bevel";
		}
	});

	$('#color-picker').spectrum({
    showAlpha: true,
    showPalette: true,
    showInitial: true,
    showInput: true,
    showButtons: false,
    palette: [['black', 'gray', 'white']],
    localStorageKey: "big.canvas",
    clickoutFiresChange: true,
    move: function(color) {
    	BC.style.color = color.toRgbString();
    }
	});

	Helper.resize();
	$(window).resize(function() {
		Helper.resize();
	});
});

