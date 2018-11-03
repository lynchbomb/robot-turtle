import Rocket from './rocket';
import { ICanvasMeta } from './interfaces/i-canvas-meta';
import { IRocketOptions } from './interfaces/i-rocket-options';
import {
  Vector,
  IBoundary,
  ICoords,
  getRadians,
  isOutOfBounds,
  randomIntBetween,
  Genetics,
  IGenetics,
  IGeneticsItem
} from 'scalar-js';

class robotTurtle {
  public FPS_THROTTLE: null | number = null;
  public IS_PAUSED: boolean = false;
  public rocketsCount: number = 20;
  public rocketWidth: number = 1;
  public rocketHeight: number = 50;
  public rockets: Array<[Rocket]> | any = [];
  public genetics: Genetics;

  public $canvas = document.getElementById('canvas') as HTMLCanvasElement;
  public canvasContext = this.$canvas.getContext('2d') as CanvasRenderingContext2D;
  public canvasMeta: ICanvasMeta = {
    canvasWidth: 0,
    canvasHeight: 0,
    canvasScaleWidth: 1,
    canvasScaleHeight: 1,
    canvasCenterX: 0,
    canvasCenterY: 0,
    canvasScalarHeight: 0,
    canvasScalarWidth: 0,
    canvasPadding: (this.rocketHeight + this.rocketWidth) * 2
  };

  public boundary: IBoundary = {
    boundaryHeight: 0,
    boundaryWidth: 0,
    boundaryPadding: 0
  };

  constructor() {
    this.initCanvas();
    this.initRockets();
    this.initGenetics(this.rockets);
    this.initRenderRockets();
    this.update();
  }

  public initCanvas() {
    this.canvasMeta.canvasWidth = this.$canvas.width;
    this.canvasMeta.canvasHeight = this.$canvas.height;
    this.canvasMeta.canvasCenterX = (this.canvasMeta.canvasWidth / this.canvasMeta.canvasScaleWidth) / 2;
    this.canvasMeta.canvasCenterY = (this.canvasMeta.canvasHeight / this.canvasMeta.canvasScaleHeight) / 2;
    this.canvasMeta.canvasScalarHeight = (this.canvasMeta.canvasHeight / this.canvasMeta.canvasScaleHeight);
    this.canvasMeta.canvasScalarWidth = (this.canvasMeta.canvasWidth / this.canvasMeta.canvasScaleWidth);
    this.boundary.boundaryHeight = this.canvasMeta.canvasHeight;
    this.boundary.boundaryWidth = this.canvasMeta.canvasWidth;
    this.boundary.boundaryPadding = this.canvasMeta.canvasPadding;
  }

  public initRockets() {
    for (let i = 0; i < this.rocketsCount; i++) {
      this.rockets.push(new Rocket({
        coords: new Vector({ x: randomIntBetween(0, this.canvasMeta.canvasScalarWidth), y: this.canvasMeta.canvasScalarHeight }),
        height: this.rocketHeight
      }));
    }
  }

  public initGenetics(currentGeneration: [IGeneticsItem]) {
    this.genetics = new Genetics(currentGeneration);
  }

  public initRenderRockets() {
    for (let i = 0; i < this.rockets.length; i++) {
      this.renderRocket(this.rockets[i]);
    }
  }

  /********************************************
  *********************************************

  [ ALL METHODS BELOW ARE RUNNING AT ~60 FPS!! ]

  *********************************************
  *********************************************/

  public update() {
    if (this.IS_PAUSED) { return; }

    this.blastRockets(this.canvasContext, this.canvasMeta);

    if (this.FPS_THROTTLE) {
      setTimeout(() => {
        window.requestAnimationFrame(this.update.bind(this));
      }, 1000 / this.FPS_THROTTLE);
    } else {
      window.requestAnimationFrame(this.update.bind(this));
    }
  }

  public blastRockets(canvasContext: CanvasRenderingContext2D, canvasMeta: ICanvasMeta) {
    this.clearCanvas();

    for (let i = 0; i < this.rockets.length; i++) {
      this.rockets[i].blast(this.canvasContext, this.canvasMeta);
      this.renderRocket(this.rockets[i]);
    }
  }

  public renderRocket(rocket: Rocket): Rocket {
    let { x, y } = rocket.coords.val;

    this.canvasContext.beginPath();
    this.canvasContext.moveTo(rocket.prevCoords.val.x, rocket.prevCoords.val.y);
    this.canvasContext.lineTo(x, y);

    this.canvasContext.stroke();
    this.canvasContext.closePath();

    // let FROM_VECTOR = [ rocket.prevCoords.val.x, rocket.prevCoords.val.y ];
    // let TO_VECTOR = [ x, y ];
    // let ROCKET_ID = rocket.id;
    // let DISTANCE_TRAVELED = getDistanceBetweenR2Vectors({x: rocket.prevCoords.val.x , y: rocket.prevCoords.val.y},{x: x, y: y});

    if (isOutOfBounds(rocket.coords.val, this.boundary)) {
      rocket.resetCoords({
        x: randomIntBetween(0, this.canvasMeta.canvasScalarWidth),
        y: this.canvasMeta.canvasScalarHeight
      });
    }

    // debugger;

    return rocket;
  }

  public clearCanvas(x: number = 0, y: number = 0, width: number = this.canvasMeta.canvasWidth, height: number = this.canvasMeta.canvasHeight): boolean {
    this.canvasContext.clearRect(x, y, width, height);

    return true;
  }

  public clearCanvasRocket(rocket: Rocket): boolean {
    this.clearCanvas(rocket.coords.val.x, rocket.coords.val.y, rocket.width, rocket.height);

    return true;
  }
}
