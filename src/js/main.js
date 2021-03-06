
//init
var left = document.getElementById('left'),
    right = document.getElementById('right'),
    links = document.getElementById('links'),
    mufta = document.getElementById('mufta'),
    data = {},
    sizes = {
    	width: mufta.getBoundingClientRect().width,
    	height: mufta.getBoundingClientRect().height,
    	cableWidth: mufta.getBoundingClientRect().width / 5,
    	cableHeight: 20,
    	lineHeight: 2,
    	connectorRadius: 3,
    	shiftXTimes: 4
    },
    tmp = {},
    shiftYGlobal = {left: [], right: []},
    textareas = document.getElementsByTagName('textarea');

	//events
	for (var n = 0; textareas[n]; n++)
		textareas[n].addEventListener('keyup', update, false);


function update() {
	shiftYGlobal = {left: [], right: []};
	_createDataArray('left');
	_createDataArray('right');

	while (mufta.lastChild) {
		mufta.removeChild(mufta.lastChild);
	}
	mufta.setAttribute('height',
		Math.max(data.left.length + shiftYGlobal.left.length, data.right.length + shiftYGlobal.right.length) * sizes.cableHeight + 1);

	renderCables();
	renderLinks();
}


//convert string cable, numberInCamble to global number
function convertLinks(_links) {
	var links,
		start,
		end,
		oneSideConnection;

	links = _links.split('-');
	if (links.length != 2)
		return _links;

	start = data['left-map'][links[0]] || data['right-map'][links[0]];
	end = data['right-map'][links[1]] || data['left-map'][links[1]];

	if (!start || !end)
		return _links;
	start--;
	end--;

	if (data['right-map'][links[0]] && data['right-map'][links[1]])
		oneSideConnection = 'right';
	else if (data['left-map'][links[0]] && data['left-map'][links[1]])
		oneSideConnection = 'left';

	return (oneSideConnection == 'left' ? '_' : '') + start + '-' + end + (oneSideConnection == 'right' ? '_' : '');
}


function renderLinks() {
	var x2, y2, x1, y1, center, color,
		matrixX = Array(Math.max(data.left.length, data.right.length)).fill(0),
		_shiftsXMap = {center: [], left: [], right: []},
		shiftsXMap,
		start,
		end,
		links;

	data.links = window.links.value.split('\n');
	for (var n = data.links.length - 1; n >= 0; n--) {
		data.links[n] = data.links[n].trim();
		if (data.links[n] == "") {
			delete data.links[n];
			continue;
		}

		links = convertLinks(data.links[n]);

		if (links.substr(-1) == "_") {
			end = start = 'right';
			x1 = x2 = sizes.width - sizes.cableWidth;
			center = x2 - sizes.cableWidth / 2;
			shiftsXMap = _shiftsXMap.right;

		} else if (links.substr(0, 1) == "_") {
			end = start = 'left';
			x1 = x2 = sizes.cableWidth;
			center = sizes.cableWidth * 1.5;
			shiftsXMap = _shiftsXMap.left;

		} else {
			start = 'left';
			end = 'right';
			x1 = sizes.cableWidth;
			x2 = sizes.width - sizes.cableWidth;
			center = (x2 - x1) / 2 + x1;
			shiftsXMap = _shiftsXMap.center;
		}

		var dn = links.replace('_','').split('-'),
			startPos = +dn[0],
			endPos = +dn[1],
			startData = data[start][startPos],
			endData = data[end][endPos];

		if (startData && endData) {
			startColor = startData.slice(-1)[0];
			endColor = endData.slice(-1)[0];

			y1 = startPos * sizes.cableHeight + sizes.cableHeight / 2;
			y2 = endPos * sizes.cableHeight + sizes.cableHeight / 2;

			y1 = _updateY(y1, start == 'left' ? 0 : Infinity);
			y2 = _updateY(y2, end == 'right' ? Infinity : 0);

			shiftX = 0;
			if (startPos != endPos) {
				shiftX = startPos < endPos ? 1 : -1;
				while (shiftsXMap.indexOf(shiftX) >=0)
					shiftX += shiftX > 0 ? 1 : -1;
				shiftsXMap.push(shiftX);
				shiftX *= sizes.lineHeight * sizes.shiftXTimes;

				//vertical shift
				if (shiftX > 0) {
					y1 += sizes.lineHeight;
					y2 += sizes.lineHeight;
				} else {
					y1 -= sizes.lineHeight;
					y2 -= sizes.lineHeight;
				}
			}

			_addLine(x1, y1, center + shiftX, y1, startColor);
			_addLine(center + shiftX, y1, center + shiftX, y2, startColor);
			_addLine(center + shiftX, y2, x2, y2, endColor);
			if (startColor != endColor) {
				_addSoldering(center + shiftX, y2, startColor, endColor);
			}
		}


	}

	window.links.value = data.links.join('\n');
}


function renderCables() {
	var node,
	    color,
	    prev = [],
	    dn,
	    y, x, width, height,
	    cable = 0;

	for (var n = 0; data.left[n]; n++) {
		dn = data.left[n];
		color = dn[dn.length -1];
		node = _addConnector(color, n, 'left');

		for (var l = 0; l < dn.length - 1; l++) {
			if (!prev[l])
				prev[l] = {data: dn[l], n: n};
			else if (prev[l].data != dn[l]) {
				y = prev[l].n * sizes.cableHeight;
				width = sizes.cableWidth / dn.length;
				x = width * l;
				height = (n - prev[l].n) * sizes.cableHeight;
				node = _addRect(y, x, width, height, "#fff");
				_addText(prev[l].data, y + height/2, x + width/2, "-90");
				prev[l] = {data: dn[l], n: n};
			}
		}
	}
	for (var l = 0; l < dn.length - 1; l++) {
		y = prev[l].n * sizes.cableHeight;
		width = sizes.cableWidth / dn.length;
		x = width * l;
		height = (n - prev[l].n) * sizes.cableHeight;
		node = _addRect(y, x, width, height, "#fff");
		_addText(prev[l].data, y + height/2, x + width/2, "-90");
	}
	prev = [];

	for (var n = 0; data.right[n]; n++) {
		dn = data.right[n];
		color = dn[dn.length -1];
		node = _addConnector(color, n, 'right');

		for (var l = 0; l < dn.length - 1; l++) {
			if (!prev[l])
				prev[l] = {data: dn[l], n: n};
			else if (prev[l].data != dn[l]) {
				y = prev[l].n * sizes.cableHeight;
				width = sizes.cableWidth / dn.length;
				x = sizes.width - width * (l + 1);
				height = (n - prev[l].n) * sizes.cableHeight;
				node = _addRect(y, x, width, height, "#fff");
				_addText(prev[l].data, y + height/2, x + width/2, "90");
				prev[l] = {data: dn[l], n: n};
			}
		}
	}
	for (var l = 0; l < dn.length - 1; l++) {
		y = prev[l].n * sizes.cableHeight;
		width = sizes.cableWidth / dn.length;
		x = sizes.width - width * (l + 1);
		height = (n - prev[l].n) * sizes.cableHeight;
		node = _addRect(y, x, width, height, "#fff");
		_addText(prev[l].data, y + height/2, x + width/2, "90");
	}
}


function _addConnector(color, n, pos) {
	var y = n * sizes.cableHeight,
	    x = pos == 'left' ? 0 : sizes.width - sizes.cableWidth,
	    height = sizes.cableHeight,
	    width = sizes.cableWidth;

	_addRect(y, x, width, height, color);
}

function _addRect(y, x, width, height, color) {
	var node = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	y = _updateY(y, x);
	node.setAttribute('y', y);
	node.setAttribute('x', x);
	node.setAttribute('height', height);
	node.setAttribute('width', width);
	node.setAttribute('style', "fill:" + color + "; stroke-width:1; stroke:#111");
	mufta.appendChild(node);
	return node;
}
function _addLine(x1, y1, x2, y2, color) {
	var node = document.createElementNS('http://www.w3.org/2000/svg', 'line');
	node.setAttribute('y1', y1);
	node.setAttribute('x1', x1);
	node.setAttribute('y2', y2);
	node.setAttribute('x2', x2);
	node.setAttribute('style', "stroke:" + color + "; stroke-width:" + sizes.lineHeight); //; shape-rendering:crispEdges;
	mufta.appendChild(node);
	return node;
}
function _addSoldering(cx, cy, colorFill, colorBorder) {
	var node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	node.setAttribute('cy', cy);
	node.setAttribute('cx', cx);
	node.setAttribute('r', sizes.connectorRadius);
	node.setAttribute('fill', colorFill);
	node.setAttribute('style', "stroke:" + colorBorder + "; stroke-width:1"); //; shape-rendering:crispEdges;
	mufta.appendChild(node);
	return node;
}
function _addText(text, y, x, rotate) {
	var newText = document.createElementNS('http://www.w3.org/2000/svg',"text");
	y = _updateY(y, x);
	newText.setAttribute("y",y);
	newText.setAttribute("x",x);
	if (rotate)
		newText.setAttribute("transform","rotate(" + rotate + ", " + x + ", " + y + ")");
	newText.setAttribute("font-family","sans-serif");
	newText.setAttribute("font-size","10px");
	newText.setAttribute("text-anchor","middle");
	newText.setAttribute("dominant-baseline","middle");
	newText.setAttribute("fill","red");
	newText.appendChild(document.createTextNode(text));
	mufta.appendChild(newText);
	return newText;
}


function _createDataArray(name) {

	if (!window[name] && !window[name].value) return;

	var rows0 = window[name].value.split('\n'),//.sort();
		cable,
		row,
		numberInCabel = 1;
	
	data[name] = [];
	data[name + '-map'] = {};

	for (var n = 0; rows0[n]; n++) {
		rows0[n] = rows0[n].trim();
		if (rows0[n] == "") continue;
		row = rows0[n].split(',');
		data[name].push(row);
		if (row[0] != cable) {
			numberInCabel = 1;
			cable = row[0];
			shiftYGlobal[name].push(sizes.cableHeight * n);
		}
		data[name + '-map'][row[0] + ',' + numberInCabel++] = n + 1;
	}
	window[name].value = rows0.join('\n');

}


function _updateY(y, x) {
	var name = x < sizes.width / 2 ? 'left' : 'right';
	for(var n = shiftYGlobal[name].length; n >= 0; n--) {
		if (shiftYGlobal[name][n] <= y) {
			y += Math.max(n, 0) * 20;
			break;
		}
	}
	return y + 1;
}