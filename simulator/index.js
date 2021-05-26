  var canvas;
  var ctx;
  var mouse; //Position de la souris
  var mouse_lastmousedown; //Position de la souris lors du dernier clic de la souris
  var objs = []; //objet
  var objCount = 0; //Nombre d'objets

  //Multiple select
  var selectGr = [] // {name:, elements:[{}, {}]}, {name:, elements:[{}, {}]}
  var currentSelectedGr = []; //[{}, {}]
  var isConstructing = false; //Créer un nouvel objet
  var isSelectingMultipleObject = false;
  var isMovingMultipleObject = false;

  //Rotation
  var isRotating = false;
  var isChoosingSeg = false;
  var isSettingRotationPoint = false;
  var rotationPoint = {x: Infinity, y: Infinity}; //The last rotation point that have been choosen
  var rotationPoint_ = {x: Infinity, y: Infinity}; //The rotation point that is display while choosing rotation point over the segment
  var mouseBeforeRotation = {x: Infinity, y: Infinity};
  var mouseAfterRotation = {x: Infinity, y: Infinity};
  var nearestSeg = {diff: Infinity, path: {from: -1, to: -1}, affine: {m: 0, p: 0}}; //Le côté de l'objet le plus proche de la souris lors du placement du point de rotation
  
  //Text
  var text = "Exemple";

  var constructionPoint; //Créer la position de départ de l'objet
  var draggingObj = -1; //Le numéro de l'objet glissé (-1 signifie pas de glissement, -3 signifie tout l'écran, -4 signifie l'observateur)
  var positioningObj = -1; //Entrez le numéro de l'objet dans les coordonnées (-1 signifie non, -4 signifie observateur)
  var draggingPart = {}; //Informations sur la pièce et la position de la souris déplacées
  var selectedObj = -1; //Numéro d'objet sélectionné (-1 signifie non sélectionné)
  var AddingObjType = ''; //Faites glisser l'espace vide pour ajouter le type de l'objet
  var waitingRays = []; //Lumière à traiter
  var waitingRayCount = 0; //Nombre de lumière à traiter
  var rayDensity_light = 0.1; //Densité lumineuse (mode dépendant de la lumière)
  var rayDensity_images = 1; //Densité lumineuse (mode lié à l'image)
  var extendLight = false; //L'image de l'observateur
  var showLight = true; //Montrer la lumière
  var gridSize = 60; //Taille de la grille
  var origin = {x: 0, y: 0}; //Coordonnées d'origine de la grille
  var undoArr = []; //Données de récupération
  var undoIndex = 0; //Emplacement actuel restauré
  var undoLimit = 20; //Nombre maximum d'étapes de récupération
  var undoUBound = 0; //Limite supérieure des données de récupération actuelles
  var undoLBound = 0; //Limite inférieure des données de récupération actuelles
  var observer;
  var mode = 'light';
  var timerID = -1;
  var isDrawing = false;
  var hasExceededTime = false;
  var forceStop = false;
  var lastDrawTime = -1;
  var stateOutdated = false; //L'état a changé depuis le dernier dessin
  var minShotLength = 1e-6; //La distance la plus courte entre les deux effets de lumière (les effets de lumière inférieurs à cette distance seront ignorés)
  var minShotLength_squared = minShotLength * minShotLength;
  var snapToDirection_lockLimit_squared = 900; //Le carré de la distance de déplacement nécessaire pour verrouiller la direction de l'accrochage lors du déplacement d'un objet et de l'utilisation de la fonction d'accrochage à la direction
  var clickExtent_line = 10;
  var clickExtent_point = 10;
  var clickExtent_point_construct = 10;
  var tools_normal = ['laser', 'radiant', 'parallel', 'blackline', 'ruler', 'protractor', 'regular', 'text', ''];
  var tools_withList = ['mirror_', 'refractor_'];
  var tools_inList = ['mirror', 'arcmirror', 'idealmirror', 'lens', 'refractor', 'halfplane', 'circlelens'];
  var modes = ['light', 'extended_light', 'images', 'observer'];
  var xyBox_cancelContextMenu = false;
  var scale = 1;

  window.onload = function(e) {
    init_i18n();
    canvas = document.getElementById('canvas1');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');



    mouse = graphs.point(0, 0);
    //mode=document.getElementById("mode").value;
    //observer=graphs.circle(graphs.point(canvas.width*0.5,canvas.height*0.5),20);
    //document.getElementById('objAttr_text').value="";
    //toolbtn_clicked(AddingObjType);

    if (typeof(Storage) !== "undefined" && localStorage.rayOpticsData) {
      document.getElementById('textarea1').value = localStorage.rayOpticsData;
    }


    if (document.getElementById('textarea1').value != '')
    {
      JSONInput();
      toolbtn_clicked('');
    }
    else
    {
      initParameters();
    }
    undoArr[0] = document.getElementById('textarea1').value;
    document.getElementById('undo').disabled = true;
    document.getElementById('redo').disabled = true;

    //Delete all the group for all objects
    for(o of objs) o.group = [];

    window.onmousedown = function(e)
    {
      selectObj(-1);
    };
    window.ontouchstart = function(e)
    {
      selectObj(-1);
    };


    canvas.onmousedown = function(e)
    {
      document.getElementById('objAttr_text').blur();
      document.body.focus();
      canvas_onmousedown(e);
      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
      return false;
    };

    canvas.onmousemove = function(e)
    {
      canvas_onmousemove(e);
    };

    canvas.onmouseup = function(e)
    {
      canvas_onmouseup(e);
    };

    // IE9, Chrome, Safari, Opera
    canvas.addEventListener("mousewheel", canvas_onmousewheel, false);
    // Firefox
    canvas.addEventListener("DOMMouseScroll", canvas_onmousewheel, false);

    function canvas_onmousewheel(e) {
      // cross-browser wheel delta
      var e = window.event || e; // old IE support
      var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
      var d = scale;
      if (delta < 0) {
        d = scale * 0.9;
      } else if (delta > 0) {
        d = scale / 0.9;
      }
      d = Math.max(25, Math.min(500, d * 100));
      setScaleWithCenter(d / 100, (e.pageX - e.target.offsetLeft) / scale, (e.pageY - e.target.offsetTop) / scale);
      window.toolBarViewModel.zoom.value(d);
      return false;
    }

    canvas.ontouchstart = function(e)
    {
      document.getElementById('objAttr_text').blur();
      document.body.focus();
      canvas_onmousedown(e);
      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
    };

    canvas.ontouchmove = function(e)
    {
      canvas_onmousemove(e);
      e.preventDefault();
    };

    canvas.ontouchend = function(e)
    {
      canvas_onmouseup(e);
      e.preventDefault();
    };

    canvas.ontouchcancel = function(e)
    {
      canvas_onmouseup(e);
      undo();
      e.preventDefault();
    };

    canvas.ondblclick = function(e)
    {
      canvas_ondblclick(e);
    };


    tools_normal.forEach(function(element, index)
    {
      document.getElementById('tool_' + element).onmouseenter = function(e) {toolbtn_mouseentered(element, e);};
      document.getElementById('tool_' + element).onclick = function(e) {toolbtn_clicked(element, e);};
      cancelMousedownEvent('tool_' + element);
    });

    tools_withList.forEach(function(element, index)
    {
      document.getElementById('tool_' + element).onclick = function(e) {toolbtn_clicked(element, e);};
      document.getElementById('tool_' + element + 'list').onmouseleave = function(e) {toollist_mouseleft(element, e);};
      cancelMousedownEvent('tool_' + element);
    });

    tools_inList.forEach(function(element, index)
    {
      document.getElementById('tool_' + element).onclick = function(e) {toollistbtn_clicked(element, e);};
      cancelMousedownEvent('tool_' + element);
    });


    document.getElementById('undo').onclick = undo;
    cancelMousedownEvent('undo');
    document.getElementById('redo').onclick = redo;
    cancelMousedownEvent('redo');
    document.getElementById('reset').onclick = function() {initParameters();createUndoPoint();};
    cancelMousedownEvent('reset');
    document.getElementById('accessJSON').onclick = accessJSON;
    cancelMousedownEvent('accessJSON');
    document.getElementById('save_canvas').onclick = function() {
      let can = $("#canvas1");
      let img = can[0].toDataURL("image/png");

      var link = document.createElement('a');
      link.href = img;
      link.download = 'Scene.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    cancelMousedownEvent('save_canvas');
    document.getElementById('save').onclick = function()
    {
      document.getElementById('saveBox').style.display = '';
      document.getElementById('save_name').select();
    };
    cancelMousedownEvent('save');
    document.getElementById('open').onclick = function()
    {
      document.getElementById('openfile').click();
    };
    cancelMousedownEvent('open');

    document.getElementById('openfile').onchange = function()
    {
      open(this.files[0]);
    };

    modes.forEach(function(element, index)
    {
    document.getElementById('mode_' + element).onclick = function() {
      modebtn_clicked(element);
      createUndoPoint();
    };
    cancelMousedownEvent('mode_' + element);
    });
    document.getElementById('zoom').oninput = function()
    {
      setScale(this.value / 100);
      draw();
    };
    document.getElementById('zoom_txt').onfocusout = function()
    {
      setScale(this.value / 100);
      draw();
    };
    document.getElementById('zoom_txt').onkeyup = function()
    {
      if (event.keyCode === 13) {
        setScale(this.value / 100);
        draw();
      }
    };
    document.getElementById('zoom').onmouseup = function()
    {
      setScale(this.value / 100); //Pour le rendre disponible aux navigateurs qui ne prennent pas en charge oninput
      createUndoPoint();
    };
    document.getElementById('zoom').ontouchend = function()
    {
      setScale(this.value / 100); //Pour le rendre disponible aux navigateurs qui ne prennent pas en charge oninput
      createUndoPoint();
    };
    cancelMousedownEvent('rayDensity');
    document.getElementById('rayDensity').oninput = function()
    {
      setRayDensity(Math.exp(this.value));
      draw();
    };
    document.getElementById('rayDensity_txt').onfocusout = function()
    {
      setRayDensity(Math.exp(this.value));
      draw();
    };
    document.getElementById('rayDensity_txt').onkeyup = function()
    {
      if (event.keyCode === 13) {
        setRayDensity(Math.exp(this.value));
        draw();
      }
    };
    document.getElementById('rayDensity').onmouseup = function()
    {
      setRayDensity(Math.exp(this.value)); //Pour le rendre disponible aux navigateurs qui ne prennent pas en charge oninput
      draw();
      createUndoPoint();
    };
    document.getElementById('rayDensity').ontouchend = function()
    {
      setRayDensity(Math.exp(this.value)); //Pour le rendre disponible aux navigateurs qui ne prennent pas en charge oninput
      draw();
      createUndoPoint();
    };
    cancelMousedownEvent('rayDensity');
    cancelMousedownEvent('lockobjs_');
    cancelMousedownEvent('grid_');
    document.getElementById('showgrid_').onclick = function() {draw()};
    document.getElementById('showgrid').onclick = function() {draw()};
    cancelMousedownEvent('showgrid_');

    document.getElementById('forceStop').onclick = function()
    {
      if (timerID != -1)
      {
        forceStop = true;
      }
    };
    cancelMousedownEvent('forceStop');
    document.getElementById('objAttr_range').oninput = function()
    {
      setAttr(document.getElementById('objAttr_range').value * 1);
    };

    document.getElementById('objAttr_range').onmouseup = function()
    {
      createUndoPoint();
    };

    document.getElementById('objAttr_range').ontouchend = function()
    {
      setAttr(document.getElementById('objAttr_range').value * 1);
      createUndoPoint();
    };
    cancelMousedownEvent('objAttr_range');
    document.getElementById('objAttr_text').onchange = function()
    {
      setAttr(document.getElementById('objAttr_text').value * 1);
    };
    cancelMousedownEvent('objAttr_text');
    document.getElementById('objAttr_text').onkeydown = function(e)
    {
      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
    };
    document.getElementById('objAttr_text').onclick = function(e)
    {
      this.select();
    };
    document.getElementById('setAttrAll').onchange = function()
    {
      setAttr(document.getElementById('objAttr_text').value * 1);
      createUndoPoint();
    };
    cancelMousedownEvent('setAttrAll');
    cancelMousedownEvent('setAttrAll_');

    document.getElementById('copy').onclick = function()
    {
      objs[objs.length] = JSON.parse(JSON.stringify(objs[selectedObj]));
      draw();
      createUndoPoint();
    };
    cancelMousedownEvent('copy');
    document.getElementById('delete').onclick = function()
    {
      removeObj(selectedObj);
      draw();
      createUndoPoint();
    };
    cancelMousedownEvent('delete');
    document.getElementById('textarea1').onchange = function()
    {
      JSONInput();
      createUndoPoint();
    };
    document.getElementById('objSetPointRot_button').onclick = function() {
      if(!isMovingMultipleObject && objs[selectedObj].type == "refractor") isChoosingSeg = true;
      if(isMovingMultipleObject) isSettingRotationPoint = true;
    }
    cancelMousedownEvent('objSetPointRot_button');
    
    document.getElementById('toggleGroupPanel_button').onclick = function() {
      //Define onready script.js
    }
    cancelMousedownEvent('toggleGroupPanel_button');

    document.getElementById('save_name').onkeydown = function(e)
    {
      if (e.keyCode == 13)
      {
        //enter
        document.getElementById('save_confirm').onclick();
      }
      if (e.keyCode == 27)
      {
        //esc
        document.getElementById('save_cancel').onclick();
      }

      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
    };
    document.getElementById('save_cancel').onclick = function()
    {
      document.getElementById('saveBox').style.display = 'none';
    };
    document.getElementById('save_confirm').onclick = save;

    cancelMousedownEvent('saveBox');


    document.getElementById('xybox').onkeydown = function(e)
    {
      //(e.keyCode)
      if (e.keyCode == 13)
      {
        //enter
        confirmPositioning(e.ctrlKey, e.shiftKey);
      }
      if (e.keyCode == 27)
      {
        //esc
        endPositioning();
      }

      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
    };

    document.getElementById('xybox').oninput = function(e)
    {
      this.size = this.value.length;
    };

    document.getElementById('xybox').addEventListener('contextmenu', function(e) {
      if (xyBox_cancelContextMenu)
      {
         e.preventDefault();
         xyBox_cancelContextMenu = false;
      }
        }, false);

    cancelMousedownEvent('xybox');


    window.ondragenter = function(e)
    {
      e.stopPropagation();
      e.preventDefault();
    };

    window.ondragover = function(e)
    {
      e.stopPropagation();
      e.preventDefault();
    };

    window.ondrop = function(e)
    {
      e.stopPropagation();
      e.preventDefault();

      var dt = e.dataTransfer;
      if (dt.files[0])
      {
        var files = dt.files;
        open(files[0]);
      }
      else
      {
        var fileString = dt.getData('text');
        document.getElementById('textarea1').value = fileString;
        selectedObj = -1;
        JSONInput();
        createUndoPoint();
      }
    };

    canvas.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        }, false);

    toolbtn_clicked('laser');
  };


  //==========================Dessiner des objets===============================

  function draw()
  {
    stateOutdated = true;
    document.getElementById('forceStop').style.display = 'none';
    if (timerID != -1)
    {
      //Si le programme traite le dernier dessin, arrêtez le traitement
      clearTimeout(timerID);
      timerID = -1;
      isDrawing = false;
    }

    if (!isDrawing)
    {
      isDrawing = true;
      draw_();
    }
  }


  function draw_() {
    if (!stateOutdated)
    {
      isDrawing = false;
      return;
    }
    stateOutdated = false;

    JSONOutput();
    canvasPainter.cls(); //Toile transparente
    ctx.globalAlpha = 1;
    hasExceededTime = false;
    waitingRays = []; //Vider la zone d'attente
    shotRayCount = 0;



    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    if (document.getElementById('showgrid').checked)
    {
      //Dessiner une grille
      //ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgb(64,64,64)';
      var dashstep = 4;
      ctx.beginPath();
      for (var x = origin.x / scale % gridSize; x <= canvas.width / scale; x += gridSize)
      {
        for (var y = 0; y <= canvas.height / scale; y += dashstep)
        {
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + dashstep * 0.5);
        }
      }
      for (var y = origin.y / scale % gridSize; y <= canvas.height / scale; y += gridSize)
      {
        for (var x = 0; x <= canvas.width / scale; x += dashstep)
        {
          ctx.moveTo(x, y);
          ctx.lineTo(x + dashstep * 0.5, y);
        }
      }
      ctx.stroke();
    }
    ctx.restore();


    //Dessiner des objets
    for (var i = 0; i < objs.length; i++)
    {
      objTypes[objs[i].type].draw(objs[i], canvas); //Dessiner l'objet [i]
      if (objTypes[objs[i].type].shoot)
      {
        objTypes[objs[i].type].shoot(objs[i]); //Si objs [i] peut tirer de la lumière, laissez-la tirer
      }
    }
    shootWaitingRays();
    if (mode == 'observer')
    {
      //Dessinez un observateur instantané
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.fillStyle = 'blue';
      ctx.arc(observer.c.x, observer.c.y, observer.r, 0, Math.PI * 2, false);
      ctx.fill();
    }
    lastDrawTime = new Date();
    //ctx.setTransform(1,0,0,1,0,0);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////
  //===============================Zone de traitement de la rotation ===================================
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  function choosingSeg(draggingPart_, i) {
    if(isMovingMultipleObject) return
    if (draggingPart_.part == 0) {
      //Here, the dragging part is a segment
      let clickedObject = objs[i];
      //Let's get the nearest segment from the mouse
      var pathFunction;
      //Get the affine function of each side of the polygon
      $.each(clickedObject.path, (index, value) => {
        let secondPt;
        //Because the polygon is closed, treat the last path with a destination back to 0
        //Get the affine function for all the line of the polygon
        if (index != clickedObject.path.length - 1) {
          pathFunction = graphs.affineFunctionOfTwoPoints(value.x, clickedObject.path[(index + 1)].x, value.y, clickedObject.path[(index + 1)].y);
          secondPt = index + 1;
        } else {
          pathFunction = graphs.affineFunctionOfTwoPoints(value.x, clickedObject.path[0].x, value.y, clickedObject.path[0].y);
          secondPt = 0;
        }
        //The nearest segment is the closest distance between where the mouse should be according to the function and the real position of the mouse
        let supposedY = pathFunction.m * mouse.x + pathFunction.p;
        let diff = Math.abs(mouse.y - supposedY);
        if (diff < nearestSeg.diff) {
          nearestSeg.diff = diff;
          nearestSeg.path.from = index;
          nearestSeg.path.to = secondPt;
          nearestSeg.affine.m = pathFunction.m;
          nearestSeg.affine.p = pathFunction.p;
        }
      });
    }
    //Here we want to prevent the user to choose another segment while he will choose the right location of the point
    isChoosingSeg = false;
  }

  function choosingRotationPoint() {
    //Theses functions are used to get the intersection of the choosen side and the perpedicular line passing by the mouse
    let sideFunction = nearestSeg.affine;
    let perpendicularToMouse = graphs.perpendicularOfLine(sideFunction.m, mouse.x, mouse.y);
    let intersection = graphs.intersection(sideFunction, perpendicularToMouse);
    rotationPoint_ = intersection;
    //These are the coordonates of the two bounds of the segments
    let fromPath = objs[selectedObj].path[nearestSeg.path.from]
    let toPath = objs[selectedObj].path[nearestSeg.path.to]

    //If the intersection is out of bounds, return
    if((sideFunction.m > 0) && ((intersection.x > fromPath.x) || (intersection.x < toPath.x))) return
    if((sideFunction.m < 0) && ((intersection.x < fromPath.x) || (intersection.x > toPath.x))) return
    draw();
    ctx.fillRect(intersection.x-2, intersection.y-2, 3, 3);
    ctx.fillStyle = "red";
  }
  
  function doARotationOnASingleElement(angleRad) {
      drawRotationPoint()
      for(pt of objs[selectedObj].path) {
          //Do a rotation arround the rotation point
          let newCoord = graphs.rotateArround(pt, rotationPoint, angleRad);
          pt.x = newCoord.x;
          pt.y = newCoord.y;
      }
  }

  function doARotationOnCurrentSetOfGroup(angleRad) {
      drawRotationPoint()
      for(c of currentSelectedGr[0].elements) {
        for(o of objs) if(c == o) {
          switch(o.type) {
            case "refractor": {
              for(pt of o.path) {
                let newCoord = graphs.rotateArround(pt, rotationPoint, angleRad);
                pt.x = newCoord.x;
                pt.y = newCoord.y;
              }
              break
            };
            case "radiant": {
              let newCoord = graphs.rotateArround(o, rotationPoint, angleRad);
              o.x = newCoord.x;
              o.y = newCoord.y;
              break
            };
            default: {
              let newCoord = graphs.rotateArround(o.p1, rotationPoint, angleRad);
              o.p1.x = newCoord.x;
              o.p1.y = newCoord.y;
              newCoord = graphs.rotateArround(o.p2, rotationPoint, angleRad);
              o.p2.x = newCoord.x;
              o.p2.y = newCoord.y;
              if(o.p3) {
                newCoord = graphs.rotateArround(o.p3, rotationPoint, angleRad);
                o.p3.x = newCoord.x;
                o.p3.y = newCoord.y;
              }
              break;
            };
          }
        }
      }
  }

  function doARotation() {
    if(mouseBeforeRotation.x == Infinity) {mouseBeforeRotation = {x: mouse.x, y: mouse.y}; return;}
    mouseAfterRotation = {x: mouse.x, y: mouse.y};
    //Point A = Cursor before rotation - Point B = Rotation point - Point C = Cursor after rotation
    var distanceBefAft = Math.sqrt(Math.pow(mouseAfterRotation.x - mouseBeforeRotation.x, 2) + Math.pow(mouseAfterRotation.y - mouseBeforeRotation.y, 2));
    var distanceAftRot = Math.sqrt(Math.pow(mouseAfterRotation.x - rotationPoint.x, 2) + Math.pow(mouseAfterRotation.y - rotationPoint.y, 2));
    var distanceBefRot = Math.sqrt(Math.pow(rotationPoint.x - mouseBeforeRotation.x, 2) + Math.pow(rotationPoint.y - mouseBeforeRotation.y, 2));
    
    //Doing Al-Kashi theorem with the three distance above to find the angle ABC
    var angleRad = Math.acos((Math.pow(distanceBefAft, 2) - (Math.pow(distanceBefRot, 2) + Math.pow(distanceAftRot, 2))) / ((-2) * distanceAftRot * distanceBefRot));

    //Because angle are always positive, we want to go back if the mouse goes counterclockwise
    if(!isClockwise(mouseBeforeRotation, rotationPoint, mouseAfterRotation)) angleRad = -angleRad;
    
    mouseBeforeRotation = mouseAfterRotation;
    if(!isMovingMultipleObject) doARotationOnASingleElement(angleRad);
    if(isMovingMultipleObject) doARotationOnCurrentSetOfGroup(angleRad);
  }

  /**
   * Determine if a point is on left of another point, so if the mouse goes clockwise
   * @param {{x,y}} pt1 the point we want to know its relative location based on pt3
   * @param {{x,y}} pt2 the center point
   * @param {{x,y}} pt3 reference for pt1
   * @returns 
   */
  function isClockwise(pt1, pt2, pt3) {
    return ((pt2.x - pt1.x) * (pt3.y - pt1.y) - (pt2.y - pt1.y) * (pt3.x - pt1.x)) > 0;
  }

  function drawRotationPoint() {
    var rotationPTInterval = setInterval(function() {
      ctx.fillRect(rotationPoint.x-2, rotationPoint.y-2, 3, 3);
      ctx.fillStyle = "red";
      if(!isRotating) clearInterval(rotationPTInterval);
    }, 10)
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  //========================================Zone de traitement de la lumière==================================================
  //////////////////////////////////////////////////////////////////////////////////////////////////////

  //======================Mettez une lumière dans la zone d'attente=======================
  function addRay(ray) {
    waitingRays[waitingRays.length] = ray;
  }

  //====================Obtenez la densité lumineuse du mode actuel====================
  function getRayDensity()
  {
    if (mode == 'images' || mode == 'observer')
    {
      return rayDensity_images;
    }
    else
    {
      return rayDensity_light;
    }
  }


  //====================Lumière de la zone d'attente=========================
  function shootWaitingRays() {
    timerID = -1;
    var st_time = new Date();
    //var instantObserver=mode=="observer";
    var alpha0 = 1;
    //var alpha0=document.getElementById("lightAlpha").value;
    ctx.globalAlpha = alpha0;
    //canvas.getContext('2d').lineWidth = 2;
    var ray1;
    var observed;
    var last_ray;
    var last_intersection;
    var s_obj;
    var s_obj_index;
    var last_s_obj_index;
    var s_point;
    var s_point_temp;
    //var s_len;
    var s_lensq;
    var s_lensq_temp;
    var observed_point;
    var observed_intersection;
    var rpd;
    var leftRayCount = waitingRays.length;
    var surfaceMerging_objs = [];

    //ctx.beginPath();
    while (leftRayCount != 0 && !forceStop)
    {
      if (new Date() - st_time > 200)
      {
        //S'il a été calculé pour dépasser 200ms
        //Reposez-vous pendant 10 ms avant de continuer (pour éviter que le programme ne réponde)
        document.getElementById('status').innerHTML = shotRayCount + ' rays (' + leftRayCount + ' waiting)'; //顯示狀態
        hasExceededTime = true;
        timerID = setTimeout(shootWaitingRays, 10); //10ms Revenez ici plus tard function
        document.getElementById('forceStop').style.display = '';
        //(timerID)
        return; //Hors de la function
      }

      leftRayCount = 0; //Recommencer le calcul du nombre de rayons restants
      last_s_obj_index = -1;
      last_ray = null;
      last_intersection = null;
      for (var j = 0; j < waitingRays.length; j++)
      {
        if (waitingRays[j] && waitingRays[j].exist)
        {
          //Si waitingRays[j] existe
          //Commencer la prise de vuewaitingRays[j](La dernière lumière dans la zone d'attente)
          //Déterminez quel objet cette lumière frappera en premier après son tir

          //↓Recherchez chaque "objet qui croise cette lumière", et trouvez "l'objet qui est l'intersection de l'objet et du rayon] et l'objet le plus proche de [la tête du rayon]"
          s_obj = null; //"Jusqu'à présent, parmi les objets vérifiés, [l'intersection avec le rayon] est la plus proche de [la tête du rayon]"
          s_obj_index = -1;
          s_point = null;  //L'intersection de s_obj et du rayon
          surfaceMerging_objs = []; //L'objet à interfacer avec l'objet tiré
          //surfaceMerging_obj_index=-1;
          //s_len=Infinity;
          s_lensq = Infinity; //Réglez "Le carré de la distance entre [s_obj et l'intersection du rayon] et [la tête du rayon] à l'infini (car aucun objet n'a encore été vérifié, et maintenant je recherche la valeur minimale)
          observed = false; //waitingRays[j]Vu par les observateurs
          for (var i = 0; i < objs.length; i++)
          {
            //↓Siobjs[i]Affectera la lumière
            if (objTypes[objs[i].type].rayIntersection) {
              //↓Détermine si objs [i] croise cette lumière
              s_point_temp = objTypes[objs[i].type].rayIntersection(objs[i], waitingRays[j]);
              if (s_point_temp && !waitingRays[j].regular)
              {
                //À ce stade, cela signifie que objs [i] est "l'objet qui croise cette lumière", et que le point d'intersection est s_point_temp
                s_lensq_temp = graphs.length_squared(waitingRays[j].p1, s_point_temp); //La distance entre l'intersection et [la tête du rayon]
                if (s_point && graphs.length_squared(s_point_temp, s_point) < minShotLength_squared && (objTypes[objs[i].type].supportSurfaceMerging || objTypes[s_obj.type].supportSurfaceMerging))
                {
                  //Cette lumière frappe deux objets en même temps, et au moins un prend en charge la fusion d'interface

                  if (objTypes[s_obj.type].supportSurfaceMerging)
                  {
                    if (objTypes[objs[i].type].supportSurfaceMerging)
                    {
                      //Les deux supportent la fusion d'interface (par exemple, deux réfracteurs sont connectés d'un côté)
                      surfaceMerging_objs[surfaceMerging_objs.length] = objs[i];
                    }
                    else
                    {
                      //Seule la première interface de prise de vue prend en charge la fusion d'interface
                      //Définissez l'objet à tirer sur un objet qui ne prend pas en charge la fusion d'interface (si la limite du réfracteur chevauche un écran anti-lumière, seule l'action de l'écran anti-lumière sera effectuée)
                      s_obj = objs[i];
                      s_obj_index = i;
                      s_point = s_point_temp;
                      s_lensq = s_lensq_temp;

                      surfaceMerging_objs = [];
                    }
                  }
                }
                else if (s_lensq_temp < s_lensq && s_lensq_temp > minShotLength_squared)
                {
                  //↑Si "la distance entre l'intersection de [objs [i] et le rayon] et [la tête du rayon]" est supérieure à "l'objet qui a été vérifié jusqu'à présent, [l'intersection avec le rayon] est la plus proche de [ la tête du rayon] "C'est encore court

                  s_obj = objs[i]; //Mise à jour "Jusqu'à présent, parmi les objets vérifiés, [l'intersection de l'objet et du rayon] est la plus proche de [la tête du rayon]"
                  s_obj_index = i;
                  s_point = s_point_temp; //s_point est également mis à jour
                  s_lensq = s_lensq_temp; //s_len est également mis à jour ensemble

                  surfaceMerging_objs = [];
                }
              }
            }
          }
          ctx.globalAlpha = alpha0 * waitingRays[j].brightness;
          //↓Si la lumière ne frappe aucun objet
          if (s_lensq == Infinity)
          {
            if (mode == 'light' || mode == 'extended_light')
            {
              if(!waitingRays[j].regular) {
                canvasPainter.draw(waitingRays[j], 'rgb(255,255,128)'); //Dessine cette lumière
              } else {
                canvasPainter.draw(waitingRays[j], 'rgb(128,236,255)'); //Dessine cette normale
              }
              //if(waitingRays[j].gap)canvasPainter.draw(waitingRays[j],canvas,"rgb(0,0,255)");
            }
            if (mode == 'extended_light' && !waitingRays[j].isNew)
            {
              canvasPainter.draw(graphs.ray(waitingRays[j].p1, graphs.point(waitingRays[j].p1.x * 2 - waitingRays[j].p2.x, waitingRays[j].p1.y * 2 - waitingRays[j].p2.y)), 'rgb(255,128,0)'); //畫出這條光的延長線
            }

            if (mode == 'observer')
            {
              //Utiliser l'observateur instantané
              observed_point = graphs.intersection_line_circle(waitingRays[j], observer)[2];
              if (observed_point)
              {
                if (graphs.intersection_is_on_ray(observed_point, waitingRays[j]))
                {
                  observed = true;
                }
              }
            }

            //waitingRays[j]=null  //Retirez cette lumière de la zone d'attente
            //Cette lumière a atteint l'infini, pas besoin de s'en occuper
          }
          else
          {
            //A ce moment, la lumière représentative frappera s_obj (objet) à s_point (position) après avoir passé s_len (distance).
            if (mode == 'light' || mode == 'extended_light')
            {
              canvasPainter.draw(graphs.segment(waitingRays[j].p1, s_point), 'rgb(255,255,128)'); //Dessine cette lumière
              //if(waitingRays[j].gap)canvasPainter.draw(graphs.segment(waitingRays[j].p1,s_point),canvas,"rgb(0,0,255)");
            }
            if (mode == 'extended_light' && !waitingRays[j].isNew)
            {
              canvasPainter.draw(graphs.ray(waitingRays[j].p1, graphs.point(waitingRays[j].p1.x * 2 - waitingRays[j].p2.x, waitingRays[j].p1.y * 2 - waitingRays[j].p2.y)), 'rgb(255,128,0)'); //Dessinez l'extension de cette lumière
              canvasPainter.draw(graphs.ray(s_point, graphs.point(s_point.x * 2 - waitingRays[j].p1.x, s_point.y * 2 - waitingRays[j].p1.y)), 'rgb(80,80,80)'); //Tracez cette longue ligne de lumière vers l'avant

            }

            if (mode == 'observer')
            {
              //Utiliser l'observateur instantané
              observed_point = graphs.intersection_line_circle(waitingRays[j], observer)[2];

              if (observed_point)
              {

                if (graphs.intersection_is_on_segment(observed_point, graphs.segment(waitingRays[j].p1, s_point)))
                {
                  observed = true;
                }
              }
            }


          }
          if (mode == 'observer' && last_ray)
          {
            //Mode: observateur instantané
            if (!waitingRays[j].gap)
            {
              observed_intersection = graphs.intersection_2line(waitingRays[j], last_ray); //L'intersection des rayons observés

              if (observed)
              {
                if (last_intersection && graphs.length_squared(last_intersection, observed_intersection) < 25)
                {
                  //Lorsque les intersections sont assez proches les unes des autres
                  if (graphs.intersection_is_on_ray(observed_intersection, graphs.ray(observed_point, waitingRays[j].p1)) && graphs.length_squared(observed_point, waitingRays[j].p1) > 1e-5)
                  {

                    ctx.globalAlpha = alpha0 * (waitingRays[j].brightness + last_ray.brightness) * 0.5;
                    if (s_point)
                    {
                      rpd = (observed_intersection.x - waitingRays[j].p1.x) * (s_point.x - waitingRays[j].p1.x) + (observed_intersection.y - waitingRays[j].p1.y) * (s_point.y - waitingRays[j].p1.y);
                      //(observed_intersection-waitingRays[j].p1)與(s_point-waitingRays[j].p1)之內積
                    }
                    else
                    {
                      rpd = (observed_intersection.x - waitingRays[j].p1.x) * (waitingRays[j].p2.x - waitingRays[j].p1.x) + (observed_intersection.y - waitingRays[j].p1.y) * (waitingRays[j].p2.y - waitingRays[j].p1.y);
                      //(observed_intersection-waitingRays[j].p1)與(waitingRays[j].p2-waitingRays[j].p1)之內積
                    }
                    if (rpd < 0)
                    {
                      //Image virtuelle
                      canvasPainter.draw(observed_intersection, 'rgb(255,128,0)'); //Dessiner comme
                    }
                    else if (rpd < s_lensq)
                    {
                      //Image réelle
                      canvasPainter.draw(observed_intersection, 'rgb(255,255,128)'); //Dessiner comme
                    }
                    canvasPainter.draw(graphs.segment(observed_point, observed_intersection), 'rgb(0,0,255)'); //畫出連線
                  }
                  else
                  {
                    canvasPainter.draw(graphs.ray(observed_point, waitingRays[j].p1), 'rgb(0,0,255)'); //畫出觀察到的光線(射線)
                  }
                }
                else //if(last_intersection && (last_intersection.x*last_intersection.x+last_intersection.y*last_intersection.y>100))
                {
                  if (last_intersection)
                  {
                    canvasPainter.draw(graphs.ray(observed_point, waitingRays[j].p1), 'rgb(0,0,255)'); //畫出觀察到的光線(射線)
                  }
                  /*
                  else
                  {
                    canvasPainter.draw(graphs.ray(observed_point,waitingRays[j].p1),canvas,"rgb(255,0,0)");
                  }
                  */
                }
              }
              last_intersection = observed_intersection;
            }
            else
            {
              last_intersection = null;
            }
          }

          if (mode == 'images' && last_ray)
          {
            //Mode: comme
            if (!waitingRays[j].gap)
            {

              observed_intersection = graphs.intersection_2line(waitingRays[j], last_ray);
              if (last_intersection && graphs.length_squared(last_intersection, observed_intersection) < 25)
              {
                ctx.globalAlpha = alpha0 * (waitingRays[j].brightness + last_ray.brightness) * 0.5;

                if (s_point)
                {
                  rpd = (observed_intersection.x - waitingRays[j].p1.x) * (s_point.x - waitingRays[j].p1.x) + (observed_intersection.y - waitingRays[j].p1.y) * (s_point.y - waitingRays[j].p1.y);
                  //(observed_intersection-waitingRays[j].p1)與(s_point-waitingRays[j].p1)Produit intérieur
                }
                else
                {
                  rpd = (observed_intersection.x - waitingRays[j].p1.x) * (waitingRays[j].p2.x - waitingRays[j].p1.x) + (observed_intersection.y - waitingRays[j].p1.y) * (waitingRays[j].p2.y - waitingRays[j].p1.y);
                  //(observed_intersection-waitingRays[j].p1)與(waitingRays[j].p2-waitingRays[j].p1)Produit intérieur
                }

                if (rpd < 0)
                {
                  //Image virtuelle
                  canvasPainter.draw(observed_intersection, 'rgb(255,128,0)'); //畫出像
                }
                else if (rpd < s_lensq)
                {
                  //Image réelle
                  canvasPainter.draw(observed_intersection, 'rgb(255,255,128)'); //畫出像
                }
                else
                {
                  //Imaginaire
                  canvasPainter.draw(observed_intersection, 'rgb(80,80,80)'); //畫出像
                }
              }
              last_intersection = observed_intersection;
            }

          }




          if (last_s_obj_index != s_obj_index)
          {
            waitingRays[j].gap = true;
          }
          waitingRays[j].isNew = false;


          //==================
          //last_ray=waitingRays[j];
          last_ray = {p1: waitingRays[j].p1, p2: waitingRays[j].p2};
          //last_s_obj=s_obj;
          last_s_obj_index = s_obj_index;
          if (s_obj)
          {
            objTypes[s_obj.type].shot(s_obj, waitingRays[j], j, s_point, surfaceMerging_objs);
          }
          else
          {
            waitingRays[j] = null;
          }

          shotRayCount = shotRayCount + 1; //Nombre de rayons traités +1
          if (waitingRays[j] && waitingRays[j].exist)
          {
            leftRayCount = leftRayCount + 1;
          }
          //Cette lumière est traitée
        }
      }

    }
    ctx.globalAlpha = 1.0;
    //if(showLight)
    //{
      for (var i = 0; i < objs.length; i++)
        {
        objTypes[objs[i].type].draw(objs[i], canvas, true); //Dessiner objs[i]
        }
    //}
    if (mode == 'observer')
    {
      //Dessinez un observateur instantané
      //var ctx = canvas.getContext('2d');
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.fillStyle = 'blue';
      ctx.arc(observer.c.x, observer.c.y, observer.r, 0, Math.PI * 2, false);
      ctx.fill();
    }
    if (forceStop)
    {
      document.getElementById('status').innerHTML = shotRayCount + ' rays (stopped)';
      forceStop = false;
    }
    else if (hasExceededTime)
    {
      document.getElementById('status').innerHTML = shotRayCount + ' rays';
    }
    else
    {
      document.getElementById('status').innerHTML = shotRayCount + ' rays (' + (new Date() - st_time) + 'ms)';
    }
    document.getElementById('forceStop').style.display = 'none';
    //ctx.stroke();
    setTimeout(draw_, 10);
  }



  //////////////////////////////////////////////////////////////////////////////////////////////////////
  //==========================================Zone d'action de la souris================================================
  //////////////////////////////////////////////////////////////////////////////////////////////////////


  function mouseOnPoint(mouse, point)
  {
    return graphs.length_squared(mouse, point) < clickExtent_point * clickExtent_point;
  }

  function mouseOnPoint_construct(mouse, point)
  {
    return graphs.length_squared(mouse, point) < clickExtent_point_construct * clickExtent_point_construct;
  }

  function mouseOnSegment(mouse, segment)
  {
    var d_per = Math.pow((mouse.x - segment.p1.x) * (segment.p1.y - segment.p2.y) + (mouse.y - segment.p1.y) * (segment.p2.x - segment.p1.x), 2) / ((segment.p1.y - segment.p2.y) * (segment.p1.y - segment.p2.y) + (segment.p2.x - segment.p1.x) * (segment.p2.x - segment.p1.x)); //Similaire à la distance verticale entre une souris et une ligne droite
    var d_par = (segment.p2.x - segment.p1.x) * (mouse.x - segment.p1.x) + (segment.p2.y - segment.p1.y) * (mouse.y - segment.p1.y); //Similaire à la position de projection de la souris sur une ligne droite
    return d_per < clickExtent_line * clickExtent_line && d_par >= 0 && d_par <= graphs.length_segment_squared(segment);
  }

  function mouseOnLine(mouse, line)
  {
    var d_per = Math.pow((mouse.x - line.p1.x) * (line.p1.y - line.p2.y) + (mouse.y - line.p1.y) * (line.p2.x - line.p1.x), 2) / ((line.p1.y - line.p2.y) * (line.p1.y - line.p2.y) + (line.p2.x - line.p1.x) * (line.p2.x - line.p1.x)); //Similaire à la distance verticale entre une souris et une ligne droite
    return d_per < clickExtent_line * clickExtent_line;
  }

  //Accrochez la position de la souris à la position la plus proche dans la direction spécifiée (le point de projection sur la ligne droite dans cette direction)
  function snapToDirection(mouse, basePoint, directions, snapData)
  {
    var x = mouse.x - basePoint.x;
    var y = mouse.y - basePoint.y;

    if (snapData && snapData.locked)
    {
      //L'objet d'accrochage a été verrouillé
      var k = (directions[snapData.i0].x * x + directions[snapData.i0].y * y) / (directions[snapData.i0].x * directions[snapData.i0].x + directions[snapData.i0].y * directions[snapData.i0].y);
      return graphs.point(basePoint.x + k * directions[snapData.i0].x, basePoint.y + k * directions[snapData.i0].y);
    }
    else
    {
      var i0;
      var d_sq;
      var d0_sq = Infinity;
      for (var i = 0; i < directions.length; i++)
      {
        d_sq = (directions[i].y * x - directions[i].x * y) * (directions[i].y * x - directions[i].x * y) / (directions[i].x * directions[i].x + directions[i].y * directions[i].y);
        if (d_sq < d0_sq)
        {
          d0_sq = d_sq;
          i0 = i;
        }
      }

      if (snapData && x * x + y * y > snapToDirection_lockLimit_squared)
      {
        //Verrouiller l'objet d'accrochage
        snapData.locked = true;
        snapData.i0 = i0;
      }

      var k = (directions[i0].x * x + directions[i0].y * y) / (directions[i0].x * directions[i0].x + directions[i0].y * directions[i0].y);
      return graphs.point(basePoint.x + k * directions[i0].x, basePoint.y + k * directions[i0].y);
    }
  }

  //================================================================================================================================
  //=========================================================MouseDown==============================================================
  function canvas_onmousedown(e) {
  //Lorsque la souris est enfoncée
  if (e.changedTouches) {
    var et = e.changedTouches[0];
  } else {
    var et = e;
  }
  var mouse_nogrid = graphs.point((et.pageX - e.target.offsetLeft - origin.x) / scale, (et.pageY - e.target.offsetTop - origin.y) / scale); //Position réelle de la souris
  mouse_lastmousedown = mouse_nogrid;
  if (positioningObj != -1)
  {
    confirmPositioning(e.ctrlKey, e.shiftKey);
    if (!(e.which && e.which == 3))
    {
      return;
    }
  }

  if (!((e.which && (e.which == 1 || e.which == 3)) || (e.changedTouches)))
  {
    return;
  }

  //if(document.getElementById("grid").checked || e.altKey)
  if (document.getElementById('grid').checked)
  {
    //Utiliser la grille
    mouse = graphs.point(Math.round(((et.pageX - e.target.offsetLeft - origin.x) / scale) / gridSize) * gridSize, Math.round(((et.pageY - e.target.offsetTop - origin.y) / scale) / gridSize) * gridSize);

  }
  else
  {
    //N'utilisez pas de grille
    mouse = mouse_nogrid;
  }

  //Here, the user have clicked while rotating the polygon, that mean he want to stop rotating
  //Because right after the click, the program create a ray, we return to prevent that
  if(isRotating) {
    isRotating = false; 
    rotationPoint = {}; 
    nearestSeg = {diff: Infinity, path: {from: -1, to: -1}, affine: {m: 0, p: 0}};
    mouseBeforeRotation = {x: Infinity, y: Infinity};
    mouseAfterRotation = {x: Infinity, y: Infinity};
    if(!isMovingMultipleObject) {
      if(objs[selectedObj].type == "refractor") {
        for(s of objs[selectedObj].path) {
          s.x = Math.trunc(s.x);
          s.y = Math.trunc(s.y);
        }
      }
    }
    if(isMovingMultipleObject) {
      for(o of currentSelectedGr[0].elements) {
        switch(o.type) {
          case "refractor": {
            for(pt of o.path) {
              pt.x = Math.trunc(pt.x);
              pt.y = Math.trunc(pt.y);
            }
            break
          };
          case "radiant": {
            o.x = Math.trunc(o.x);
            o.y = Math.trunc(o.y);
            break
          };
          default: {
            o.p1.x = Math.trunc(o.p1.x);
            o.p1.y = Math.trunc(o.p1.y);
            o.p2.x = Math.trunc(o.p2.x);
            o.p2.y = Math.trunc(o.p2.y);
            if(o.p3) {
              o.p3.x = Math.trunc(o.p3.x);
              o.p3.y = Math.trunc(o.p3.y);
            }
            break;
          };
        }
      }
    }
    return
  }

  //Here, the user have clicked while setting rotation point (after choosing a segment)
  //Because right after the click, the program create a ray, we return to prevent that
  if(isSettingRotationPoint && !isChoosingSeg && !isMovingMultipleObject) {
    isSettingRotationPoint = false;
    isRotating = true;
    rotationPoint = rotationPoint_;
    return
  }

  if(isMovingMultipleObject && isSettingRotationPoint) {
    isSettingRotationPoint = false;
    isRotating = true;
    rotationPoint = {x: mouse.x, y: mouse.y};
    return
  }

  if (isConstructing)
  {
    if ((e.which && e.which == 1) || (e.changedTouches))
    {
      //Seul le bouton gauche de la souris réagira
      //Si un objet est en cours de création, transmettez-lui l'action directement
      objTypes[objs[objs.length - 1].type].c_mousedown(objs[objs.length - 1], mouse);
    }
  }
  else
  {
    if ((!(document.getElementById('lockobjs').checked) != (e.altKey && AddingObjType != '')) && !(e.which == 3))
    {
      //Rechercher chaque objet, trouver l'objet cliqué par la souris

      draggingPart = {};

      if (mode == 'observer')
      {
        if (graphs.length_squared(mouse_nogrid, observer.c) < observer.r * observer.r)
        {
          //Clic de souris pour observer
          draggingObj = -4;
          draggingPart = {};
          draggingPart.mouse0 = mouse; //Position de la souris au début du glissement
          draggingPart.mouse1 = mouse; //La position de la souris du point précédent lors du glissement
          draggingPart.snapData = {};
          return;
        }
      }

      var draggingPart_ = {};
      var click_lensq = Infinity;
      var click_lensq_temp;
      var targetObj_index = -1;
      //var targetObj_index_temp;
      var targetIsPoint = false;

      for (var i = 0; i < objs.length; i++)
        {
        if (typeof objs[i] != 'undefined')
          {
            draggingPart_ = {};
            if (objTypes[objs[i].type].clicked(objs[i], mouse_nogrid, mouse, draggingPart_))
            {
              //clicked() Renvoie true pour indiquer que la souris a cliqué sur l'objet

              if (draggingPart_.targetPoint)
              {
                //Clic de souris jusqu'à un point
                targetIsPoint = true; //Une fois que vous trouvez que vous pouvez atteindre le point, vous devez atteindre le point
                click_lensq_temp = graphs.length_squared(mouse_nogrid, draggingPart_.targetPoint);
                if (click_lensq_temp <= click_lensq)
                {
                  targetObj_index = i; //Lorsque le point est atteint, sélectionnez celui le plus proche de la souris
                  click_lensq = click_lensq_temp;
                  draggingPart = draggingPart_;
                }
              }
              else if (!targetIsPoint)
              {
                //Le clic de souris n'est pas un point, et le point n'a pas été cliqué jusqu'à présent
                targetObj_index = i; //Dans le cas d'un non-point, sélectionnez le dernier créé
                draggingPart = draggingPart_;
                if(selectedObj != -1) unhighlightObject(selectedObj);
              }
              if(AddingObjType == "regular") {
                let perp;
                let f_point_away;
                let s_point_away
                let regular;
                if(objs[targetObj_index].type == "refractor") {
                  //Let's draw a normal on the refractor
                  choosingSeg(draggingPart_, i);
                  perp = graphs.perpendicularOfLine(nearestSeg.affine.m, mouse.x, mouse.y);
                  nearestSeg = {diff: Infinity, path: {from: -1, to: -1}, affine: {m: 0, p: 0}};
                  f_point_away = {"x": mouse.x + 400, "y": (mouse.x + 400) * perp.m + perp.p};
                  s_point_away = {"x": mouse.x - 400, "y": (mouse.x - 400) * perp.m + perp.p};
                  regular = {type: 'regular', p1: f_point_away, p2: s_point_away, group: [], selected: false};
                  objs.push(regular);
                }
                if(objs[targetObj_index].type == "halfplane") {
                  //Let's draw a normal on the halfplane
                  let obj = objs[i];
                  let affineHalfplane = graphs.affineFunctionOfTwoPoints(obj.p1.x, obj.p2.x, obj.p1.y, obj.p2.y);
                  perp = graphs.perpendicularOfLine(affineHalfplane.m, mouse.x, mouse.y);
                  f_point_away = {"x": mouse.x + 400, "y": (mouse.x + 400) * perp.m + perp.p};
                  s_point_away = {"x": mouse.x - 400, "y": (mouse.x - 400) * perp.m + perp.p};
                  regular = {type: 'regular', p1: f_point_away, p2: s_point_away, group: [], selected: false};
                  objs.push(regular);
                }
                draw();
              }
              if(isChoosingSeg && AddingObjType != "regular") {
                //Here, the user clicked on the "Set a rotation point" and on the polygon
                choosingSeg(draggingPart_, i);
                //Here, now the user have choosed the segment, give him the right to set a point of rotation while moving the mouse
                isSettingRotationPoint = true;
              }
              if(e.which == 1 && e.ctrlKey) {
                //Enter here to add on selected gr
                if(!isSelectingMultipleObject) currentSelectedGr = [];
                isSelectingMultipleObject = true;
                let isAlreadyIn = false;
                for(c of currentSelectedGr) if(objs[i] == c) isAlreadyIn = true;
                if(!isAlreadyIn) currentSelectedGr.push(objs[i]);
              }
            }
          }
          
        }
        if (targetObj_index != -1)
        {
          //Enfin décidé de choisir targetObj_index
          selectObj(targetObj_index);
          draggingPart.originalObj = JSON.parse(JSON.stringify(objs[targetObj_index])); //Stocker temporairement l'état de l'objet avant de le faire glisser
          draggingPart.hasDuplicated = false;
          draggingObj = targetObj_index;
          return;
        }
      }

    if (draggingObj == -1)
      {
      //=======================La souris a cliqué dans un espace vide==========================
       if ((AddingObjType == '') || (e.which == 3))
       {
       //=========================Prêt à faire un panoramique sur tout l'écran======================
         draggingObj = -3;
         draggingPart = {};
         //draggingPart.part=0;
         draggingPart.mouse0 = mouse; //Position de la souris au début du glissement
         draggingPart.mouse1 = mouse; //La position de la souris du point précédent lors du glissement
         draggingPart.mouse2 = origin; //Original origin.
         draggingPart.snapData = {};
         document.getElementById('obj_settings').style.display = 'none';
         selectedObj = -1;
       }
       else
       {
       //======================Créer un nouvel objet=========================
        objs[objs.length] = objTypes[AddingObjType].create(mouse);
        isConstructing = true;
        constructionPoint = mouse;
        if (objs[selectedObj])
        {
          if (hasSameAttrType(objs[selectedObj], objs[objs.length - 1]))
          {
            objs[objs.length - 1].p = objs[selectedObj].p; //Rendre les propriétés supplémentaires de cet objet identiques à celles du dernier objet sélectionné (si le type est le même)
          }
        }
        selectObj(objs.length - 1);
        objTypes[objs[objs.length - 1].type].c_mousedown(objs[objs.length - 1], mouse);
       }
      }
  }
  }


  //================================================================================================================================
  //========================================================MouseMove===============================================================
  function canvas_onmousemove(e) {
  //Quand la souris bouge
  if (e.changedTouches) {
    var et = e.changedTouches[0];
  } else {
    var et = e;
  }
  var mouse_nogrid = graphs.point((et.pageX - e.target.offsetLeft - origin.x) / scale, (et.pageY - e.target.offsetTop - origin.y) / scale); //滑鼠實際位置
  var mouse2;
  //if(document.getElementById("grid").checked != e.altKey)
  if (document.getElementById('grid').checked && !(e.altKey && !isConstructing))
  {
    //Utiliser la grille
    mouse2 = graphs.point(Math.round(((et.pageX - e.target.offsetLeft - origin.x) / scale) / gridSize) * gridSize, Math.round(((et.pageY - e.target.offsetTop - origin.y) / scale) / gridSize) * gridSize);
  }
  else
  {
    //N'utilise pas de grille
    mouse2 = mouse_nogrid;
  }

  if (mouse2.x == mouse.x && mouse2.y == mouse.y)
  {
    return;
  }
  mouse = mouse2;

  if(isSettingRotationPoint && !isMovingMultipleObject) choosingRotationPoint();
  if(isRotating) {doARotation(); draw();}

  if (isConstructing)
  {
    //Si un objet est en cours de création, transmettez-lui l'action directement
    objTypes[objs[objs.length - 1].type].c_mousemove(objs[objs.length - 1], mouse, e.ctrlKey, e.shiftKey);
  }
  else
  {
    if (draggingObj == -4)
    {
      if (e.shiftKey)
      {
        var mouse_snapped = snapToDirection(mouse, draggingPart.mouse0, [{x: 1, y: 0},{x: 0, y: 1}], draggingPart.snapData);
      }
      else
      {
        var mouse_snapped = mouse;
        draggingPart.snapData = {}; //Déverrouillez la direction de glissement d'origine lorsque vous relâchez la touche Maj
      }

      var mouseDiffX = (mouse_snapped.x - draggingPart.mouse1.x); //La différence sur l'axe X entre la position actuelle de la souris et la dernière position de la souris
      var mouseDiffY = (mouse_snapped.y - draggingPart.mouse1.y); //La différence de l'axe Y entre la position actuelle de la souris et la dernière position de la souris

      observer.c.x += mouseDiffX;
      observer.c.y += mouseDiffY;

      //Mettre à jour la position de la souris
      draggingPart.mouse1 = mouse_snapped;
      draw();
    }

    if (draggingObj >= 0)
      {
       //À ce stade, cela signifie que la souris fait glisser un objet

      objTypes[objs[draggingObj].type].dragging(objs[draggingObj], mouse, draggingPart, e.ctrlKey, e.shiftKey);
      //Si l'objet entier est déplacé, l'objet d'origine sera copié lorsque la touche Ctrl est enfoncée
      if (draggingPart.part == 0)
      {
        if(isSettingRotationPoint) isSettingRotationPoint = false;
        if (e.ctrlKey && !draggingPart.hasDuplicated)
        {

          objs[objs.length] = draggingPart.originalObj;
          draggingPart.hasDuplicated = true;
        }
        if (!e.ctrlKey && draggingPart.hasDuplicated)
        {
          objs.length--;
          draggingPart.hasDuplicated = false;
        }
      }
      draw();
      }

    if (draggingObj == -3)
    {
      //========================Panoramique sur tout l'écran=======================
      //À ce stade, la souris est la position actuelle de la souris, draggingPart.mouse1 est la dernière position de la souris

      if (e.shiftKey)
      {
        var mouse_snapped = snapToDirection(mouse_nogrid, draggingPart.mouse0, [{x: 1, y: 0},{x: 0, y: 1}], draggingPart.snapData);
      }
      else
      {
        var mouse_snapped = mouse_nogrid;
        draggingPart.snapData = {}; //Déverrouillez la direction de glissement d'origine lorsque vous relâchez la touche Maj
      }

      var mouseDiffX = (mouse_snapped.x - draggingPart.mouse1.x); //La différence sur l'axe X entre la position actuelle de la souris et la dernière position de la souris
      var mouseDiffY = (mouse_snapped.y - draggingPart.mouse1.y); //La différence de l'axe Y entre la position actuelle de la souris et la dernière position de la souris
      origin.x = mouseDiffX * scale + draggingPart.mouse2.x;
      origin.y = mouseDiffY * scale + draggingPart.mouse2.y;
      draw();
    }
  }
  }
  //==================================================================================================================================
  //==============================MouseUp===============================
  function canvas_onmouseup(e) {
  if (isConstructing)
  {
    if ((e.which && e.which == 1) || (e.changedTouches))
    {
      //Si un objet est en cours de création, transmettez-lui l'action directement
      objTypes[objs[objs.length - 1].type].c_mouseup(objs[objs.length - 1], mouse);
      if (!isConstructing)
      {
        //L'objet a été créé
        createUndoPoint();
      }
    }
  }
  else
  {
    if (e.which && e.which == 3 && draggingObj == -3 && mouse.x == draggingPart.mouse0.x && mouse.y == draggingPart.mouse0.y)
    {
      draggingObj = -1;
      draggingPart = {};
      canvas_ondblclick(e);
      return;
    }
    draggingObj = -1;
    draggingPart = {};
    createUndoPoint();
  }



  }

  function canvas_ondblclick(e) {
    var mouse = graphs.point((e.pageX - e.target.offsetLeft - origin.x) / scale, (e.pageY - e.target.offsetTop - origin.y) / scale); //滑鼠實際位置(一律不使用格線)
    if (isConstructing)
    {
    }
    else if (mouseOnPoint(mouse, mouse_lastmousedown))
    {
      draggingPart = {};
      if (mode == 'observer')
      {
        if (graphs.length_squared(mouse, observer.c) < observer.r * observer.r)
        {

          //Clic de souris pour observer
          positioningObj = -4;
          draggingPart = {};
          draggingPart.targetPoint = graphs.point(observer.c.x, observer.c.y);
          draggingPart.snapData = {};

          document.getElementById('xybox').style.left = (draggingPart.targetPoint.x * scale + origin.x) + 'px';
          document.getElementById('xybox').style.top = (draggingPart.targetPoint.y * scale + origin.y) + 'px';
          document.getElementById('xybox').value = '(' + (draggingPart.targetPoint.x) + ',' + (draggingPart.targetPoint.y) + ')';
          document.getElementById('xybox').size = document.getElementById('xybox').value.length;
          document.getElementById('xybox').style.display = '';
          document.getElementById('xybox').select();
          document.getElementById('xybox').setSelectionRange(1, document.getElementById('xybox').value.length - 1);
          xyBox_cancelContextMenu = true;

          return;
        }
      }


      //Rechercher chaque objet, trouver l'objet cliqué par la souris
      var draggingPart_ = {};
      var click_lensq = Infinity;
      var click_lensq_temp;
      var targetObj_index = -1;

      for (var i = 0; i < objs.length; i++)
        {
        if (typeof objs[i] != 'undefined')
          {
            draggingPart_ = {};
            if (objTypes[objs[i].type].clicked(objs[i], mouse, mouse, draggingPart_))
            {
              //clicked()Renvoie true pour indiquer que la souris a cliqué sur l'objet

              if (draggingPart_.targetPoint)
              {
                //Clic de souris jusqu'à un point
                //targetIsPoint=true; //Une fois que vous trouvez que vous pouvez atteindre le point, vous devez atteindre le point
                click_lensq_temp = graphs.length_squared(mouse, draggingPart_.targetPoint);
                if (click_lensq_temp <= click_lensq)
                {
                  targetObj_index = i; //Lorsque le point est atteint, sélectionnez celui le plus proche de la souris
                  click_lensq = click_lensq_temp;
                  draggingPart = draggingPart_;
                }
              }
            }
          }
        }
        if (targetObj_index != -1)
        {
          selectObj(targetObj_index);
          draggingPart.originalObj = JSON.parse(JSON.stringify(objs[targetObj_index])); //Stocker temporairement l'état de l'objet avant de le faire glisser
          draggingPart.hasDuplicated = false;
          positioningObj = targetObj_index; //L'objet de la position d'entrée est défini sur i

          document.getElementById('xybox').style.left = (draggingPart.targetPoint.x * scale + origin.x) + 'px';
          document.getElementById('xybox').style.top = (draggingPart.targetPoint.y * scale + origin.y) + 'px';
          document.getElementById('xybox').value = '(' + (draggingPart.targetPoint.x) + ',' + (draggingPart.targetPoint.y) + ')';
          document.getElementById('xybox').size = document.getElementById('xybox').value.length;
          document.getElementById('xybox').style.display = '';
          document.getElementById('xybox').select();
          document.getElementById('xybox').setSelectionRange(1, document.getElementById('xybox').value.length - 1);
          xyBox_cancelContextMenu = true;
        }
    }

  }


  window.onresize = function(e) {
  if (ctx)
  {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
  }
  };

  function selectObj(index)
  {
    unhighlightAllObj();
    if (index < 0 || index >= objs.length)
    {
      //Si cet objet n'existe pas
      selectedObj = -1;
      document.getElementById('obj_settings').style.display = 'none';
      return;
    }
    selectedObj = index;
    document.getElementById('obj_name').innerHTML = document.getElementById('tool_' + objs[index].type).dataset['n'];
    if (objTypes[objs[index].type].p_name)
    {
      //Si cet objet a des paramètres ajustables (tels que l'indice de réfraction)
      document.getElementById('p_box').style.display = '';
      var p_temp = objs[index].p;
      //document.getElementById('p_name').innerHTML=objTypes[objs[index].type].p_name;
      document.getElementById('p_name').innerHTML = document.getElementById('tool_' + objs[index].type).dataset['p'];
      document.getElementById('objAttr_range').min = objTypes[objs[index].type].p_min;
      document.getElementById('objAttr_range').max = objTypes[objs[index].type].p_max;
      document.getElementById('objAttr_range').step = objTypes[objs[index].type].p_step;
      document.getElementById('objAttr_range').value = p_temp;
      document.getElementById('objAttr_text').value = p_temp;
      objs[index].p = p_temp;
      for (var i = 0; i < objs.length; i++)
      {
        if (i != selectedObj && hasSameAttrType(objs[i], objs[selectedObj]))
        {
          //S'il existe un autre objet du même type, l'option "Appliquer tout" sera affichée
          document.getElementById('setAttrAll_box').style.display = '';
          //document.getElementById('setAttrAll').checked=false;
          break;
        }
        if (i == objs.length - 1)
        {
          document.getElementById('setAttrAll_box').style.display = 'none';
        }
      }
    }
    else
    {
      document.getElementById('p_box').style.display = 'none';
    }
    highlightObject(index);
    draw();
    document.getElementById('obj_settings').style.display = '';
  }

  function hasSameAttrType(obj1, obj2)
  {
    //obj1.type==obj2.type
    //objTypes[obj1.type].p_name==objTypes[obj2.type].p_name
    return document.getElementById('tool_' + obj1.type).dataset['n'] == document.getElementById('tool_' + obj2.type).dataset['n'];
  }

  function setAttr(value)
  {
    //alert(value)
    objs[selectedObj].p = value;
    document.getElementById('objAttr_text').value = value;
    document.getElementById('objAttr_range').value = value;
    if (document.getElementById('setAttrAll').checked)
    {
      for (var i = 0; i < objs.length; i++)
      {
        if (hasSameAttrType(objs[i], objs[selectedObj]))
        {
          objs[i].p = value;
        }
      }
    }
    draw();
  }

  function confirmPositioning(ctrl, shift)
  {
    var xyData = JSON.parse('[' + document.getElementById('xybox').value.replace(/\(|\)/g, '') + ']');
    //if(xyData.length==2)
    //Ce n'est que lorsque deux valeurs (coordonnées) sont entrées que l'action sera entreprise
    if (xyData.length == 2)
    {
      if (positioningObj == -4)
      {
        //Observateur
        observer.c.x = xyData[0];
        observer.c.y = xyData[1];
      }
      else
      {
        //objet
        objTypes[objs[positioningObj].type].dragging(objs[positioningObj], graphs.point(xyData[0], xyData[1]), draggingPart, ctrl, shift);
      }
      draw();
      createUndoPoint();
    }

    endPositioning();
  }

  function highlightObject(index) {
    objs[index].selected = true;
  }

  function unhighlightObject(index) {
    objs[index].selected = false;
  }

  function unhighlightAllObj() {
    for(o of objs) o.selected = false;
  }

  function endPositioning()
  {
    document.getElementById('xybox').style.display = 'none';
    positioningObj = -1;
    draggingPart = {};
  }

  function removeObj(index)
  {
    for (var i = index; i < objs.length - 1; i++)
    {
      objs[i] = JSON.parse(JSON.stringify(objs[i + 1]));
    }
    isConstructing = false;
    objs.length = objs.length - 1;
    selectedObj--;
    selectObj(selectedObj);
  }

  function createUndoPoint()
  {
    undoIndex = (undoIndex + 1) % undoLimit;
    undoUBound = undoIndex;
    document.getElementById('undo').disabled = false;
    document.getElementById('redo').disabled = true;
    undoArr[undoIndex] = document.getElementById('textarea1').value;
    if (undoUBound == undoLBound)
    {
      //Le nombre d'étapes de récupération a atteint la limite supérieure
      undoLBound = (undoLBound + 1) % undoLimit;
    }
  }

  function undo()
  {
    if (isConstructing)
    {
      //Si l'utilisateur crée un objet en appuyant sur restaurer, alors seule l'action de création sera terminée à ce moment, et aucune restauration réelle ne sera effectuée

      isConstructing = false;
      objs.length--;
      selectObj(-1);

      draw();
      return;
    }
    if (positioningObj != -1)
    {
      //Si l'utilisateur entre des coordonnées en appuyant sur la touche de restauration, alors seule l'action de saisie de coordonnées sera terminée à ce moment et aucune restauration réelle ne sera effectuée.
      endPositioning();
      return;
    }
    if (undoIndex == undoLBound)
        //Atteint la limite inférieure des données de récupération
        return;
    undoIndex = (undoIndex + (undoLimit - 1)) % undoLimit;
    document.getElementById('textarea1').value = undoArr[undoIndex];
    JSONInput();
    document.getElementById('redo').disabled = false;
    if (undoIndex == undoLBound)
    {
      //Atteint la limite inférieure des données de récupération
      document.getElementById('undo').disabled = true;
    }

  }

  function redo()
  {
    isConstructing = false;
    endPositioning();
    if (undoIndex == undoUBound)
      //Atteint la limite inférieure des données de récupération
      return;
    undoIndex = (undoIndex + 1) % undoLimit;
    document.getElementById('textarea1').value = undoArr[undoIndex];
    JSONInput();
    document.getElementById('undo').disabled = false;
    if (undoIndex == undoUBound)
    {
      //Atteint la limite inférieure des données de récupération
      document.getElementById('redo').disabled = true;
    }
  }

  function initParameters()
  {
    isConstructing = false;
    endPositioning();
    objs.length = 0;
    selectObj(-1);

    //AddingObjType="";
    rayDensity_light = 0.1; //Densité lumineuse (mode dépendant de la lumière)
    rayDensity_images = 1; //Densité lumineuse (mode lié à l'image)
    window.toolBarViewModel.rayDensity.value(rayDensity_light);
    extendLight = false; //L'image de l'observateur
    showLight = true; //Montrer la lumière
    origin = {x: 0, y: 0};
    observer = null;
    scale = 1;
    window.toolBarViewModel.zoom.value(scale * 100);
    //mode="light";
    toolbtn_clicked('laser');
    modebtn_clicked('light');

    //Reset new UI.
    window.toolBarViewModel.tools.selected("Ray");
    window.toolBarViewModel.modes.selected("Rays");
    window.toolBarViewModel.c1.selected(false);
    window.toolBarViewModel.c2.selected(false);
    window.toolBarViewModel.c3.selected(false);

    document.getElementById('lockobjs').checked = false;
    document.getElementById('grid').checked = false;
    document.getElementById('showgrid').checked = false;

    document.getElementById('setAttrAll').checked = false;

    draw();
    //createUndoPoint();
  }

  window.onkeydown = function(e)
  {
    //Ctrl+Z
    if (e.ctrlKey && e.keyCode == 90)
    {
    if (document.getElementById('undo').disabled == false)
    {
      undo();
    }
    return false;
    }

    //Ctrl+D
    if (e.ctrlKey && e.keyCode == 68)
    {
    objs[objs.length] = JSON.parse(JSON.stringify(objs[selectedObj]));
    draw();
    createUndoPoint();
    return false;
    }
    //Ctrl+Y
    if (e.ctrlKey && e.keyCode == 89)
    {
      document.getElementById('redo').onclick();
    }

    //Ctrl+S
    if (e.ctrlKey && e.keyCode == 83)
    {
      document.getElementById('save').onclick();
    }

    //Ctrl+O
    if (e.ctrlKey && e.keyCode == 79)
    {
      document.getElementById('open').onclick();
    }

    //Delete
    if (e.keyCode == 46 || e.keyCode == 8)
    {
    if (selectedObj != -1)
    {
      removeObj(selectedObj);
      draw();
      createUndoPoint();
    }
    return false;
    }

    //Ctrl
    /*
    if(e.keyCode==17)
    {
      if(draggingObj!=-1)
      {
        canvas_onmousemove(e,true);
      }
    }
    */

    //Arrow Keys
    if (e.keyCode >= 37 && e.keyCode <= 40)
    {
      var step = document.getElementById('grid').checked ? gridSize : 1;
      if (selectedObj >= 0)
      {
        if (e.keyCode == 37)
        {
          objTypes[objs[selectedObj].type].move(objs[selectedObj], -step, 0);
        }
        if (e.keyCode == 38)
        {
          objTypes[objs[selectedObj].type].move(objs[selectedObj], 0, -step);
        }
        if (e.keyCode == 39)
        {
          objTypes[objs[selectedObj].type].move(objs[selectedObj], step, 0);
        }
        if (e.keyCode == 40)
        {
          objTypes[objs[selectedObj].type].move(objs[selectedObj], 0, step);
        }
      }
      else if (mode == 'observer')
      {
        if (e.keyCode == 37)
        {
          observer.c.x -= step;
        }
        if (e.keyCode == 38)
        {
          observer.c.y -= step;
        }
        if (e.keyCode == 39)
        {
          observer.c.x += step;
        }
        if (e.keyCode == 40)
        {
          observer.c.y += step;
        }
      }
      else
      {
        for (var i = 0; i < objs.length; i++)
        {
          if (e.keyCode == 37)
          {
            objTypes[objs[i].type].move(objs[i], -step, 0);
          }
          if (e.keyCode == 38)
          {
            objTypes[objs[i].type].move(objs[i], 0, -step);
          }
          if (e.keyCode == 39)
          {
            objTypes[objs[i].type].move(objs[i], step, 0);
          }
          if (e.keyCode == 40)
          {
            objTypes[objs[i].type].move(objs[i], 0, step);
          }
        }
      }
      draw();
    }



};

  window.onkeyup = function(e)
  {
    //Arrow Keys
    if (e.keyCode >= 37 && e.keyCode <= 40)
    {
      createUndoPoint();
    }

  };


  //=========================================JSONSortie entrée====================================================
  function JSONOutput()
  {
    document.getElementById('textarea1').value = JSON.stringify({version: 2, objs: objs, mode: mode, rayDensity_light: rayDensity_light, rayDensity_images: rayDensity_images, observer: observer, origin: origin, scale: scale});
    if (typeof(Storage) !== "undefined") {
      localStorage.rayOpticsData = document.getElementById('textarea1').value;
    }
  }
  function JSONInput()
  {
    var jsonData = JSON.parse(document.getElementById('textarea1').value);
    if (typeof jsonData != 'object')return;
    if (!jsonData.version)
    {
      //"Line Optics Simulation 1.0" ou format antérieur
      //var str1=document.getElementById("textarea1").value.replace(/"point"|"xxa"/g,"1").replace(/"circle"|"xxf"/g,"5");
      var str1 = document.getElementById('textarea1').value.replace(/"point"|"xxa"|"aH"/g, '1').replace(/"circle"|"xxf"/g, '5').replace(/"k"/g, '"objs"').replace(/"L"/g, '"p1"').replace(/"G"/g, '"p2"').replace(/"F"/g, '"p3"').replace(/"bA"/g, '"exist"').replace(/"aa"/g, '"parallel"').replace(/"ba"/g, '"mirror"').replace(/"bv"/g, '"lens"').replace(/"av"/g, '"notDone"').replace(/"bP"/g, '"lightAlpha"').replace(/"ab"|"observed_light"|"observed_images"/g, '"observer"');
      jsonData = JSON.parse(str1);
      if (!jsonData.objs)
      {
        jsonData = {objs: jsonData};
      }
      if (!jsonData.mode)
      {
        jsonData.mode = 'light';
      }
      if (!jsonData.rayDensity_light)
      {
        jsonData.rayDensity_light = 1;
      }
      if (!jsonData.rayDensity_images)
      {
        jsonData.rayDensity_images = 1;
      }
      if (!jsonData.scale)
      {
        jsonData.scale = 1;
      }
      jsonData.version = 1;
    }
    if (jsonData.version == 1)
    {
      //"Line Optics Simulation 1.1" à "Line Optics Simulation 1.2"
      jsonData.origin = {x: 0, y: 0};
    }
    if (jsonData.version > 2)
    {
      //Est une version de fichier plus récente que cette version
      return;
    }
    //TODO: Create new version.
    if (!jsonData.scale)
    {
      jsonData.scale = 1;
    }

    objs = jsonData.objs;
    rayDensity_light = jsonData.rayDensity_light;
    rayDensity_images = jsonData.rayDensity_images;
    observer = jsonData.observer;
    origin = jsonData.origin;
    scale = jsonData.scale;
    modebtn_clicked(jsonData.mode);
    selectObj(selectedObj);
    //draw();
  }

  function accessJSON()
  {
    if (document.getElementById('textarea1').style.display == 'none')
    {
      document.getElementById('textarea1').style.display = '';
      document.getElementById('textarea1').select();
    }
    else
    {
      document.getElementById('textarea1').style.display = 'none';
    }

  }

  function toolbtn_mouseentered(tool, e)
  {
    hideAllLists();
  }

  function toolbtn_clicked(tool, e)
  {
    if(tool == "text") chooseText();
    tools_normal.forEach(function(element, index)
    {
      document.getElementById('tool_' + element).className = 'toolbtn';

    });
    tools_withList.forEach(function(element, index)
    {
      document.getElementById('tool_' + element).className = 'toolbtn';
    });
    tools_inList.forEach(function(element, index)
    {
      document.getElementById('tool_' + element).className = 'toollistbtn';
    });

    hideAllLists();

    document.getElementById('tool_' + tool).className = 'toolbtnselected';
    AddingObjType = tool;
    if (tool == "mirror_") {
      var t = window.toolBarViewModel.mirrors.selected();
      if (t == "Segment")
        AddingObjType = "mirror";
      else if (t == "Circular Arc")
        AddingObjType = "arcmirror";
      else if (t == "Ideal Curved")
        AddingObjType = "idealmirror";
    } else if (tool == "refractor_") {
      var t = window.toolBarViewModel.glasses.selected();
      if (t == "Half-plane")
        AddingObjType = "halfplane";
      else if (t == "Circle")
        AddingObjType = "circlelens";
      else if (t == "Free-shape")
        AddingObjType = "refractor";
      else if (t == "Ideal Lens")
        AddingObjType = "lens";
    }
  }

  function toollist_mouseleft(tool, e)
  {
    var rect = document.getElementById('tool_' + tool).getBoundingClientRect();
    mouse = graphs.point(e.pageX, e.pageY);
    if (mouse.x < rect.left || mouse.x > rect.right || mouse.y < rect.top || mouse.y > rect.bottom + 5)
    {
      document.getElementById('tool_' + tool + 'list').style.display = 'none';
      if (document.getElementById('tool_' + tool).className == 'toolbtnwithlisthover')
      {
        document.getElementById('tool_' + tool).className = 'toolbtn';
      }
    }
  }

  function hideAllLists()
  {
    tools_withList.forEach(function(element, index)
    {
      document.getElementById('tool_' + element + 'list').style.display = 'none';
      if (document.getElementById('tool_' + element).className == 'toolbtnwithlisthover')
      {
        document.getElementById('tool_' + element).className = 'toolbtn';
      }
    });
  }

  function toollistbtn_clicked(tool, e)
  {
    var selected_toolbtn; //Toolbtn précédemment pressé
    var selecting_toolbtnwithlist; //Toolbtn avec la liste à laquelle appartient ce toollistbtn
    tools_withList.forEach(function(element, index)
    {
      if (document.getElementById('tool_' + element).className == 'toolbtnwithlisthover')
      {
        selecting_toolbtnwithlist = element;
      }
      if (document.getElementById('tool_' + element).className == 'toolbtnselected')
      {
        selected_toolbtn = element;
      }
    });
    if (!selecting_toolbtnwithlist)
    {
      selecting_toolbtnwithlist = selected_toolbtn; //Ce toollistbtn appartient au toolbtn précédemment pressé
    }
    tools_normal.forEach(function(element, index)
    {
      document.getElementById('tool_' + element).className = 'toolbtn';
    });
    tools_withList.forEach(function(element, index)
    {
      document.getElementById('tool_' + element).className = 'toolbtn';
    });
    tools_inList.forEach(function(element, index)
    {
      document.getElementById('tool_' + element).className = 'toollistbtn';
    });

    hideAllLists();

    document.getElementById('tool_' + selecting_toolbtnwithlist).className = 'toolbtnselected';
    document.getElementById('tool_' + tool).className = 'toollistbtnselected';
    AddingObjType = tool;
  }

  function modebtn_clicked(mode1)
  {
    document.getElementById('mode_' + mode).className = 'toolbtn';
    document.getElementById('mode_' + mode1).className = 'toolbtnselected';
    mode = mode1;
    if (mode == 'images' || mode == 'observer')
    {
      //document.getElementById('rayDensity').value = Math.log(rayDensity_images);
      window.toolBarViewModel.rayDensity.value(Math.log(rayDensity_images));
    }
    else
    {
      //document.getElementById('rayDensity').value = Math.log(rayDensity_light);
      window.toolBarViewModel.rayDensity.value(Math.log(rayDensity_light));
    }
    if (mode == 'observer' && !observer)
    {
      //Initialiser l'observateur
      observer = graphs.circle(graphs.point((canvas.width * 0.5 - origin.x) / scale, (canvas.height * 0.5 - origin.y) / scale), 20);
    }


    draw();
  }

  function cancelMousedownEvent(id)
  {
    document.getElementById(id).onmousedown = function(e)
    {
      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
    };
    document.getElementById(id).ontouchstart = function(e)
    {
      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
    };
  }


  function setRayDensity(value)
  {
    if (mode == 'images' || mode == 'observer')
    {
      rayDensity_images = value;
    }
    else
    {
      rayDensity_light = value;
    }
  }

  function setScale(value) {
    setScaleWithCenter(value, canvas.width / scale / 2, canvas.height / scale / 2);
  }

  function setScaleWithCenter(value, centerX, centerY) {
    scaleChange = value - scale;
    origin.x *= value / scale;
    origin.y *= value / scale;
    origin.x -= centerX * scaleChange;
    origin.y -= centerY * scaleChange;
    scale = value;
    draw();
  }

  function save()
  {
    JSONOutput();

    var blob = new Blob([document.getElementById('textarea1').value], {type: 'application/json'});
    saveAs(blob, document.getElementById('save_name').value);

    document.getElementById('saveBox').style.display = 'none';
  }

  function open(readFile)
  {
    var reader = new FileReader();
    document.getElementById('save_name').value = readFile.name;
    reader.readAsText(readFile);
    reader.onload = function(evt) {
      var fileString = evt.target.result;
      document.getElementById('textarea1').value = fileString;
      endPositioning();
      selectedObj = -1;
      JSONInput();
      createUndoPoint();
    };

  }
  var lang = 'en';
  function getMsg(msg) {
    return locales[lang][msg].message;
  }

  function init_i18n() {
    if (navigator.language) {
      var browser_lang = navigator.language;
      if (browser_lang.toLowerCase() == 'zh-tw') {
        lang = 'zh-TW';
      }
      if (browser_lang.toLowerCase() == 'zh-cn') {
        lang = 'zh-CN';
      }
      lang = browser_lang.toLowerCase().substring(0, 2);
    }
    var url_lang = location.search.substr(1)
    if (url_lang && locales[url_lang]) {
      lang = url_lang;
    }
    var downarraw = '\u25BC';
    document.title = getMsg('appName');

    //===========toolbar===========
    document.getElementById('toolbar_title').innerHTML = getMsg('toolbar_title');

    //Ray
    document.getElementById('tool_laser').value = getMsg('toolname_laser');
    document.getElementById('tool_laser').dataset['n'] = getMsg('toolname_laser');

    //Point source
    document.getElementById('tool_radiant').value = getMsg('toolname_radiant');
    document.getElementById('tool_radiant').dataset['n'] = getMsg('toolname_radiant');
    document.getElementById('tool_radiant').dataset['p'] = getMsg('brightness');

    //Beam
    document.getElementById('tool_parallel').value = getMsg('toolname_parallel');
    document.getElementById('tool_parallel').dataset['n'] = getMsg('toolname_parallel');
    document.getElementById('tool_parallel').dataset['p'] = getMsg('brightness');

    //Mirror▼
    document.getElementById('tool_mirror_').value = getMsg('toolname_mirror_') + downarraw;

    //Mirror->Line
    document.getElementById('tool_mirror').value = getMsg('tooltitle_mirror');
    document.getElementById('tool_mirror').dataset['n'] = getMsg('toolname_mirror_');

    //Mirror->Circular Arc
    document.getElementById('tool_arcmirror').value = getMsg('tooltitle_arcmirror');
    document.getElementById('tool_arcmirror').dataset['n'] = getMsg('toolname_mirror_');

    //Mirror->Curve (ideal)
    document.getElementById('tool_idealmirror').value = getMsg('tooltitle_idealmirror');
    document.getElementById('tool_idealmirror').dataset['n'] = getMsg('toolname_idealmirror');
    document.getElementById('tool_idealmirror').dataset['p'] = getMsg('focallength');

    //Refractor▼
    document.getElementById('tool_refractor_').value = getMsg('toolname_refractor_') + downarraw;

    //Refractor->Half-plane
    document.getElementById('tool_halfplane').value = getMsg('tooltitle_halfplane');
    document.getElementById('tool_halfplane').dataset['n'] = getMsg('toolname_refractor_');
    document.getElementById('tool_halfplane').dataset['p'] = getMsg('refractiveindex');

    //Refractor->Circle
    document.getElementById('tool_circlelens').value = getMsg('tooltitle_circlelens');
    document.getElementById('tool_circlelens').dataset['n'] = getMsg('toolname_refractor_');
    document.getElementById('tool_circlelens').dataset['p'] = getMsg('refractiveindex');

    //Refractor->Other shape
    document.getElementById('tool_refractor').value = getMsg('tooltitle_refractor');
    document.getElementById('tool_refractor').dataset['n'] = getMsg('toolname_refractor_');
    document.getElementById('tool_refractor').dataset['p'] = getMsg('refractiveindex');

    //Refractor->Lens (ideal)
    document.getElementById('tool_lens').value = getMsg('tooltitle_lens');
    document.getElementById('tool_lens').dataset['n'] = getMsg('toolname_lens');
    document.getElementById('tool_lens').dataset['p'] = getMsg('focallength');

    //Blocker
    document.getElementById('tool_blackline').value = getMsg('toolname_blackline');
    document.getElementById('tool_blackline').dataset['n'] = getMsg('toolname_blackline');

    //Ruler
    document.getElementById('tool_ruler').value = getMsg('toolname_ruler');
    document.getElementById('tool_ruler').dataset['n'] = getMsg('toolname_ruler');

    //Protractor
    document.getElementById('tool_protractor').value = getMsg('toolname_protractor');
    document.getElementById('tool_protractor').dataset['n'] = getMsg('toolname_protractor');

    //Regular
    document.getElementById('tool_regular').value = getMsg('toolname_regular');
    document.getElementById('tool_regular').dataset['n'] = getMsg('toolname_regular');

    //Text
    document.getElementById('tool_text').value = getMsg('toolname_text');
    document.getElementById('tool_text').dataset['n'] = getMsg('toolname_text');

    //Move view
    document.getElementById('tool_').value = getMsg('toolname_');



    //===========modebar===========
    document.getElementById('modebar_title').innerHTML = getMsg('modebar_title');
    document.getElementById('mode_light').value = getMsg('modename_light');
    document.getElementById('mode_extended_light').value = getMsg('modename_extended_light');
    document.getElementById('mode_images').value = getMsg('modename_images');
    document.getElementById('mode_observer').value = getMsg('modename_observer');
    document.getElementById('rayDensity_title').innerHTML = getMsg('raydensity');


    document.getElementById('undo').value = getMsg('undo');
    document.getElementById('redo').value = getMsg('redo');
    document.getElementById('reset').value = getMsg('reset');
    document.getElementById('save_canvas').value = getMsg('save_canvas');
    document.getElementById('save').value = getMsg('save');
    document.getElementById('save_name_title').innerHTML = getMsg('save_name');
    document.getElementById('save_confirm').value = getMsg('save');
    document.getElementById('save_cancel').value = getMsg('save_cancel');
    document.getElementById('save_description').innerHTML = getMsg('save_description');
    document.getElementById('open').value = getMsg('open');
    document.getElementById('lockobjs_title').innerHTML = getMsg('lockobjs');
    document.getElementById('grid_title').innerHTML = getMsg('snaptogrid');
    document.getElementById('showgrid_title').innerHTML = getMsg('grid');

    document.getElementById('setAttrAll_title').innerHTML = getMsg('applytoall');
    document.getElementById('copy').value = getMsg('duplicate');
    document.getElementById('delete').value = getMsg('delete');
    document.getElementById('objSetPointRot_button').value = getMsg('placerotation');
    document.getElementById('toggleGroupPanel_button').value = getMsg('grouppanel');

    document.getElementById('forceStop').innerHTML = getMsg('processing');

    document.getElementById('footer_message').innerHTML = getMsg('footer_message');
    document.getElementById('homepage').innerHTML = getMsg('homepage');
    document.getElementById('source').innerHTML = getMsg('source');
  }