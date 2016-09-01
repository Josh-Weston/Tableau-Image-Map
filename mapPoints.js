	
var ViewModel = function() {

	var self = this;
	self.imgWidth = $("#main-img").width();
	self.imgHeight = $("#main-img").height();
	self.shapes = [];
	self.currentShape = undefined;
	self.drawingMode = false;
	self.ctx;

	self.createCanvas = function() {

		var canvas = document.getElementById('canvasbox');
		canvas.width = self.imgWidth;
		canvas.height = self.imgHeight;
		$('body').css('margin', '0px');
		self.canvas = canvas;
		self.ctx = self.canvas.getContext('2d');
				
	};
	
	self.drawShape = function() {
	
		self.drawingMode = true;
		self.currentShape = {
			id: self.shapes.length,
			begin: undefined, //first point is the begin
			path: []
		}
		
	}
	
	self.addPoint = function(x, y) {
		
		//Check if begin exists
		if (self.currentShape.begin === undefined) {
			self.currentShape.begin = [x, y];
			self.ctx.beginPath(); //Draw new shape
			self.ctx.moveTo(x, y);
			self.currentShape.path.push([x, y]);
			self.ctx.lineTo(x, y);
			self.addRow(x, y);
		} else {
			
			self.currentShape.path.push([x, y]);
			self.addRow(x, y);
			//Clear the entire canvas each time.
			self.clearCanvas(false);
			self.ctx.beginPath();
			self.ctx.moveTo(self.currentShape.begin[0], self.currentShape.begin[1]);
			self.currentShape.path.forEach(function(el) {
				self.ctx.lineTo(el[0], el[1]);
			});
			
			self.ctx.lineWidth = 1;
			self.ctx.stroke();
		}
		
	}
	
	self.endDraw = function() {
		self.ctx.lineTo(self.currentShape.path[0][0], self.currentShape.path[0][1]);
		self.ctx.stroke();
		self.ctx.closePath();
		self.ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'
		self.ctx.fill();
		self.shapes.push(self.currentShape);
		
		
	};
	
	self.addRow = function(x, y) {
	
		$('#coords-table > tbody').append(
			'<tr>' +
			'<td>' + self.currentShape.path.length + '</td>' +
			'<td>' + x + '</td>' +
			'<td>' + (self.canvas.height - y) + '</td>' +
			'</tr>');
		
	};
	
	self.clearCanvas = function(hardClear) {
		
		if (hardClear) {
			self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
			self.drawingMode = false;
			self.currentShape = undefined;
			$(self.canvas).removeClass('cursor');
		} else {
			self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
			
		}
		
	}

};

var GUI = function(vm) {
	
	var self = this;
	self.ctrlDown = false;
	
	$(vm.canvas).on('contextmenu', function(e) {
		e.preventDefault();
		$('#contextOptions').show();
		$('#contextOptions').css('left', e.clientX);
		$('#contextOptions').css('top', e.clientY);
	});

	$(vm.canvas).on('click', function(e) {
		
		$("#contextOptions").hide();
		
		if (vm.drawingMode === true) {
			
			vm.addPoint(e.pageX, e.pageY);
			
		}
		
	});
	
	$(window).on('keypress', function(e) {
		
		if (e.keyCode === 13 && vm.drawingMode === true) {
			vm.endDraw();
			$(vm.canvas).toggleClass('cursor');
		}
		
		if (e.keyCode === 122) {
			$('#coords-table > tbody').empty();
			vm.clearCanvas(true);
			
		}
		
	});
	
	$(window).keydown(function(e) {
		if (e.keyCode === 17) {
			self.ctrlDown = true
		}
	}).keyup(function(e) {
		if (e.keyCode === 17) {
			self.ctrlDown = false;
		}
	})
		
	$("#btnNewPath").on('click', function() {
		$('#contextOptions').hide();
		$(vm.canvas).toggleClass('cursor');
		vm.drawShape();
	});
	
}
	
//I will need an object for each path
	
function init() {

	var vm = new ViewModel();
	vm.createCanvas();

	var gui = new GUI(vm);

}