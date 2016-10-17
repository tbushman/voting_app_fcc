$.ajaxSetup({
	xhrFields: {withCredentials: true},
	error: function(xhr, status, error) {
		$('.alert').removeClass('hidden');
		$('.alert').html("Status: " + status + ", error: " + error);
	}
});

