	
var ViewModel = function() {

	var self = this;
	self.imgWidth = $("#main-img").width();
	self.imgHeight = $("#main-img").height();
	self.shapes = ko.observableArray();
	self.currentShape = undefined;
	self.drawingMode = false;

	self.createCanvas = function() {

		var canvas = document.getElementById('svgbox');
		canvas.setAttribute('width', $('#main-img').width());
		canvas.setAttribute('height', $('#main-img').height());
		$('body').css('margin', '0px');
        
        //Probably want to move this some place more appropriate
        $(canvas).on('contextmenu', function(e) {
            e.preventDefault();
            $('#contextOptions').show();
            $('#contextOptions').css('left', e.clientX);
            $('#contextOptions').css('top', e.clientY);
        });

        $(canvas).on('click', function(e) {

            $("#contextOptions").hide();
            if (self.drawingMode === true) {
                self.addPoint(e.pageX, e.pageY);
            }

        });
        
        self.canvas = canvas;
				
	};
	
	self.drawShape = function(shapeObj) {
	
		self.drawingMode = true;
        
        //Draw a new shape
        if (shapeObj == undefined) {
            self.currentShape = self.createShape();
        } else {
            self.currentShape = shapeObj;
        }
		
	}
	
	self.addPoint = function(x, y) {
        
		//Check if begin exists
		if (self.currentShape.path.length === 0) {
			
            self.currentShape.path.push('M ' + x + ' ' + y);
            
            var path = document.createElementNS("http://www.w3.org/2000/svg",'path');
            path.setAttribute('d', self.currentShape.path[0]);
            self.currentShape.el = path;
            
            $('#svgbox').append(path);
			self.addRow(x, y);
            self.gui.setStickyDraw(true);
            
		} else {
			
            var newLine = ' L ' + x + ' ' + y
			self.currentShape.path.push(newLine);
            self.currentShape.el.setAttribute('d', self.currentShape.el.getAttribute('d') + ' ' + newLine);
			self.addRow(x, y);
        
		}
		
	};
    
    self.removeLastPoint = function() {
      
        if (self.currentShape.path.length > 0) {
            self.currentShape.path = self.currentShape.path.slice(0, -1);
            self.currentShape.el.setAttribute('d', (function(path) {
                
                var newPath = "";
                for (var i = 0; i < path.length; i++) {
                    newPath += path[i];
                }
                return newPath;
            })(self.currentShape.path))
            
            self.removeRow();
        }
        
    };
	
	self.endDraw = function() {
        
        //Remove last point because of StickyDraw
        self.removeLastPoint();
        self.gui.setStickyDraw(false);
        
        //Add closing line
        var closeLine = ' Z';
        self.currentShape.path.push(closeLine);
        self.currentShape.el.setAttribute('d', self.currentShape.el.getAttribute('d') + ' ' + closeLine);
        self.currentShape.el.style.fill = 'blue';
        self.drawingMode = false;
        
        //Push to array if new shape
        if (self.shapes.indexOf(self.currentShape) < 0) {
            self.shapes.push(self.currentShape);
        }
	};
	
	self.addRow = function(x, y) {
        
		$('#coords-table > tbody').append(
			'<tr>' +
			'<td>' + self.currentShape.path.length + '</td>' +
			'<td>' + x + '</td>' +
			'<td>' + (self.canvas.getAttribute('height') - y) + '</td>' +
			'</tr>');
	};
    
    self.removeRow = function() {
      
        $('#coords-table > tbody tr:last-child').remove();
    };
    
    /**
    * Description for createShape
    * @private
    * @method createShape
    * @param {Object} id Receives id from ViewModel
    * @return {Object} Shape object
    */
    self.createShape = function() {
        
        var shape = function (id) {
            
            var self = this;
            self.id = id;
            self.path = [];
            self.el = undefined;
            self.name = "Shape #" + (id+1); 
            
        };
        
        return new shape(self.shapes().length);
        
    };
	
    /*
	self.clearCanvas = function(hardClear) {
		
		if (hardClear) {
			self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
			self.drawingMode = false;
			self.currentShape = undefined;
			$(self.canvas).removeClass('cursor');
		} else {
			self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
			
		}
		
	}*/

};

var GUI = function(vm) {
	
	var self = this;
	
	$(window).on('keypress', function(e) {
		
		if (e.keyCode === 13 && vm.drawingMode === true) {
			vm.endDraw();
			$(vm.canvas).toggleClass('cursor');
		}
		
		if (e.keyCode === 122) {
			vm.removeLastPoint();
		}
		
	});
		
	$("#btnNewPath").on('click', function() {
		$('#contextOptions').hide();
		$(vm.canvas).toggleClass('cursor');
		vm.drawShape();
	});
    
    
    self.setStickyDraw = function (toggle) {
        
        if (toggle === true) {
            
            //Create first point as dummy point to simplify implementation.
            var lastCoords = vm.currentShape.path[vm.currentShape.path.length - 1].split(' ');
            vm.addPoint(lastCoords[1], lastCoords[2]);
            
            $(vm.canvas).on('mousemove', function (e) {
        
                //Only remove the last one after the mouse has moved the first time.
                if (vm.drawingMode === true) {
                    
                    //Need it to only show the new line when the mouse is moved.
                    vm.removeLastPoint();
                    var newLine = ' L ' + e.pageX + ' ' + e.pageY
                    vm.currentShape.path.push(newLine);
                    vm.currentShape.el.setAttribute('d', vm.currentShape.el.getAttribute('d') + ' ' + newLine);
                    
                    //Clicking should set it in, and then start the process over where it should only remove the last
                    //one after it has already been added by the sticky line.

                }
        
            });
            
        } else {

            $(vm.canvas).unbind('mousemove');
        }

    };
    
    var dropTarget = document.getElementById('img-container_drop');
    
    dropTarget.addEventListener('dragover', function(event) {
       event.preventDefault();
       $('#img-container_drop').css('background-color', '#ddd');
    });
    
   dropTarget.addEventListener('dragleave', function(event) {
       event.preventDefault();
       $('#img-container_drop').css('background-color', '#fff');
       
    })
   
   dropTarget.addEventListener('drop', function(event) {
       
       //Stop browser from loading as image itself.
       event.preventDefault();
       $('#img-container_drop').css('background-color', '#fff');

       var files = event.dataTransfer.files;
       
       //Will only load the first image if more than one is dropped.
       if (/image/.test(files[0].type)) {
           var reader = new FileReader();
           reader.readAsDataURL(files[0]);
           
           reader.onload = function() {
               $('#main-img').attr('src', reader.result);
               vm.createCanvas();
               $('#img-container_drop_container').hide(); //Could completely remove, or allow too start-over
           };
           
       } else {
           alert('Please use an image file')
       }

   })
	
}
	
//I will need an object for each path
	
function init() {

	var vm = new ViewModel();
	var gui = new GUI(vm);
    vm.gui = gui;
    
    
    ko.applyBindings(vm, document.getElementById('contextOptions'));

}