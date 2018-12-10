import { compiler } from './compiler';
import { parser } from './parser';
import { analyzer } from './analyzer';

const COMMANDS = {
  // rotate to the right 90 degrees
  r() {
    console.log('RIGHT');
  },
  // rotate to the left 90 degress
  l() {
    console.log('LEFT');
  },
  // move forward by distance
  f(d: number) {
    console.log('FORWARD');
  },
};

class RobotTurtle {
  constructor() {}
  public init() {}
  public load(program: string) {
    const _program = compiler(parser(analyzer(program)));
  }
}
