// Adapted from https://github.com/0xfe/vexflow/blob/207dc59e3a6659854898c488a0a186dbcc189acd/src/tables.ts#L595

class RuntimeError extends Error {
  constructor(code, message = '') {
    super('[RuntimeError] ' + code + ': ' + message);
    this.code = code;
  }
}

const RESOLUTION = 16384;

const durations = {
  '1/2': RESOLUTION * 2,
  1: RESOLUTION / 1,
  2: RESOLUTION / 2,
  4: RESOLUTION / 4,
  8: RESOLUTION / 8,
  16: RESOLUTION / 16,
  32: RESOLUTION / 32,
  64: RESOLUTION / 64,
  128: RESOLUTION / 128,
  256: RESOLUTION / 256,
};

const durationAliases = {
  w: '1',
  h: '2',
  q: '4',

  // This is the default duration used to render bars (BarNote). Bars no longer
  // consume ticks, so this should be a no-op.
  // TODO(0xfe): This needs to be cleaned up.
  b: '256',
};

const clefs = {
  treble: { line_shift: 0 },
  bass: { line_shift: 6 },
  tenor: { line_shift: 4 },
  alto: { line_shift: 3 },
  soprano: { line_shift: 1 },
  percussion: { line_shift: 0 },
  'mezzo-soprano': { line_shift: 2 },
  'baritone-c': { line_shift: 5 },
  'baritone-f': { line_shift: 5 },
  subbass: { line_shift: 7 },
  french: { line_shift: -1 },
};

const notesInfo = {
  C: { index: 0, int_val: 0 },
  CN: { index: 0, int_val: 0, accidental: 'n' },
  'C#': { index: 0, int_val: 1, accidental: '#' },
  'C##': { index: 0, int_val: 2, accidental: '##' },
  CB: { index: 0, int_val: 11, accidental: 'b' },
  CBB: { index: 0, int_val: 10, accidental: 'bb' },
  D: { index: 1, int_val: 2 },
  DN: { index: 1, int_val: 2, accidental: 'n' },
  'D#': { index: 1, int_val: 3, accidental: '#' },
  'D##': { index: 1, int_val: 4, accidental: '##' },
  DB: { index: 1, int_val: 1, accidental: 'b' },
  DBB: { index: 1, int_val: 0, accidental: 'bb' },
  E: { index: 2, int_val: 4 },
  EN: { index: 2, int_val: 4, accidental: 'n' },
  'E#': { index: 2, int_val: 5, accidental: '#' },
  'E##': { index: 2, int_val: 6, accidental: '##' },
  EB: { index: 2, int_val: 3, accidental: 'b' },
  EBB: { index: 2, int_val: 2, accidental: 'bb' },
  F: { index: 3, int_val: 5 },
  FN: { index: 3, int_val: 5, accidental: 'n' },
  'F#': { index: 3, int_val: 6, accidental: '#' },
  'F##': { index: 3, int_val: 7, accidental: '##' },
  FB: { index: 3, int_val: 4, accidental: 'b' },
  FBB: { index: 3, int_val: 3, accidental: 'bb' },
  G: { index: 4, int_val: 7 },
  GN: { index: 4, int_val: 7, accidental: 'n' },
  'G#': { index: 4, int_val: 8, accidental: '#' },
  'G##': { index: 4, int_val: 9, accidental: '##' },
  GB: { index: 4, int_val: 6, accidental: 'b' },
  GBB: { index: 4, int_val: 5, accidental: 'bb' },
  A: { index: 5, int_val: 9 },
  AN: { index: 5, int_val: 9, accidental: 'n' },
  'A#': { index: 5, int_val: 10, accidental: '#' },
  'A##': { index: 5, int_val: 11, accidental: '##' },
  AB: { index: 5, int_val: 8, accidental: 'b' },
  ABB: { index: 5, int_val: 7, accidental: 'bb' },
  B: { index: 6, int_val: 11 },
  BN: { index: 6, int_val: 11, accidental: 'n' },
  'B#': { index: 6, int_val: 12, accidental: '#' },
  'B##': { index: 6, int_val: 13, accidental: '##' },
  BB: { index: 6, int_val: 10, accidental: 'b' },
  BBB: { index: 6, int_val: 9, accidental: 'bb' },
  R: { index: 6, rest: true }, // Rest
  X: {
    index: 6,
    accidental: '',
    octave: 4,
    code: 'noteheadXBlack',
    shift_right: 5.5,
  },
};

class Fake {
  static keyProperties(keyOctaveGlyph, clef = 'treble', params = undefined) {
    let options = { octave_shift: 0, duration: '4' };
    if (typeof params === 'object') {
      options = { ...options, ...params };
    }
    const duration = Fake.sanitizeDuration(options.duration);

    const pieces = keyOctaveGlyph.split('/');
    if (pieces.length < 2) {
      throw new RuntimeError(
        'BadArguments',
        `First argument must be note/octave or note/octave/glyph-code: ${keyOctaveGlyph}`
      );
    }

    const key = pieces[0].toUpperCase();
    const value = notesInfo[key];
    if (!value) throw new RuntimeError('BadArguments', 'Invalid key name: ' + key);
    if (value.octave) pieces[1] = value.octave.toString();

    let octave = parseInt(pieces[1], 10);

    // Octave_shift is the shift to compensate for clef 8va/8vb.
    octave += -1 * options.octave_shift;

    const baseIndex = octave * 7 - 4 * 7;
    let line = (baseIndex + value.index) / 2;
    line += Fake.clefProperties(clef).line_shift;

    let stroke = 0;

    if (line <= 0 && (line * 2) % 2 === 0) stroke = 1; // stroke up
    if (line >= 6 && (line * 2) % 2 === 0) stroke = -1; // stroke down
  
    // Integer value for note arithmetic.
    const int_value = typeof value.int_val !== 'undefined' ? octave * 12 + value.int_val : undefined;

    // If the user specified a glyph, overwrite the glyph code.
    const code = value.code;
    const shift_right = value.shift_right;
    let customNoteHeadProps = {};
    if (pieces.length > 2 && pieces[2]) {
      const glyphName = pieces[2].toUpperCase();
      customNoteHeadProps = { code: this.codeNoteHead(glyphName, duration) } || {};
    }

    return {
      key,
      octave,
      line,
      int_value,
      accidental: value.accidental,
      code,
      stroke,
      shift_right,
      displaced: false,
      ...customNoteHeadProps,
    };
  }

  static sanitizeDuration(duration) {
    const durationNumber = durationAliases[duration];
    if (durationNumber !== undefined) {
      duration = durationNumber;
    }
    if (durations[duration] === undefined) {
      throw new RuntimeError('BadArguments', `The provided duration is not valid: ${duration}`);
    }
    return duration;
  }

  static clefProperties(clef) {
    if (!clef || !(clef in clefs)) throw new RuntimeError('BadArgument', 'Invalid clef: ' + clef);
    return clefs[clef];
  }

  static codeNoteHead(type, duration) {
    let code = '';
    switch (type) {
      /* Diamond */
      case 'D0':
        code = 'noteheadDiamondWhole';
        break;
      case 'D1':
        code = 'noteheadDiamondHalf';
        break;
      case 'D2':
        code = 'noteheadDiamondBlack';
        break;
      case 'D3':
        code = 'noteheadDiamondBlack';
        break;

      /* Triangle */
      case 'T0':
        code = 'noteheadTriangleUpWhole';
        break;
      case 'T1':
        code = 'noteheadTriangleUpHalf';
        break;
      case 'T2':
        code = 'noteheadTriangleUpBlack';
        break;
      case 'T3':
        code = 'noteheadTriangleUpBlack';
        break;

      /* Cross */
      case 'X0':
        code = 'noteheadXWhole';
        break;
      case 'X1':
        code = 'noteheadXHalf';
        break;
      case 'X2':
        code = 'noteheadXBlack';
        break;
      case 'X3':
        code = 'noteheadCircleX';
        break;

      /* Square */
      case 'S1':
        code = 'noteheadSquareWhite';
        break;
      case 'S2':
        code = 'noteheadSquareBlack';
        break;

      /* Rectangle */
      case 'R1':
        code = 'vexNoteHeadRectWhite'; // no smufl code
        break;
      case 'R2':
        code = 'vexNoteHeadRectBlack'; // no smufl code
        break;

      case 'DO':
        code = 'noteheadTriangleUpBlack';
        break;
      case 'RE':
        code = 'noteheadMoonBlack';
        break;
      case 'MI':
        code = 'noteheadDiamondBlack';
        break;
      case 'FA':
        code = 'noteheadTriangleLeftBlack';
        break;
      case 'FAUP':
        code = 'noteheadTriangleRightBlack';
        break;
      case 'SO':
        code = 'noteheadBlack';
        break;
      case 'LA':
        code = 'noteheadSquareBlack';
        break;
      case 'TI':
        code = 'noteheadTriangleRoundDownBlack';
        break;

      case 'D':
      case 'H': // left for backwards compatibility
        switch (duration) {
          case '1/2':
            code = 'noteheadDiamondDoubleWhole';
            break;
          case '1':
            code = 'noteheadDiamondWhole';
            break;
          case '2':
            code = 'noteheadDiamondHalf';
            break;
          default:
            code = 'noteheadDiamondBlack';
            break;
        }
        break;
      case 'N':
      case 'G':
        switch (duration) {
          case '1/2':
            code = 'noteheadDoubleWhole';
            break;
          case '1':
            code = 'noteheadWhole';
            break;
          case '2':
            code = 'noteheadHalf';
            break;
          default:
            code = 'noteheadBlack';
            break;
        }
        break;
      case 'M': // left for backwards compatibility
      case 'X':
        switch (duration) {
          case '1/2':
            code = 'noteheadXDoubleWhole';
            break;
          case '1':
            code = 'noteheadXWhole';
            break;
          case '2':
            code = 'noteheadXHalf';
            break;
          default:
            code = 'noteheadXBlack';
            break;
        }
        break;
      case 'CX':
        switch (duration) {
          case '1/2':
            code = 'noteheadCircleXDoubleWhole';
            break;
          case '1':
            code = 'noteheadCircleXWhole';
            break;
          case '2':
            code = 'noteheadCircleXHalf';
            break;
          default:
            code = 'noteheadCircleX';
            break;
        }
        break;
      case 'CI':
        switch (duration) {
          case '1/2':
            code = 'noteheadCircledDoubleWhole';
            break;
          case '1':
            code = 'noteheadCircledWhole';
            break;
          case '2':
            code = 'noteheadCircledHalf';
            break;
          default:
            code = 'noteheadCircledBlack';
            break;
        }
        break;
      case 'SQ':
        switch (duration) {
          case '1/2':
            code = 'noteheadDoubleWholeSquare';
            break;
          case '1':
            code = 'noteheadSquareWhite';
            break;
          case '2':
            code = 'noteheadSquareWhite';
            break;
          default:
            code = 'noteheadSquareBlack';
            break;
        }
        break;
      case 'TU':
        switch (duration) {
          case '1/2':
            code = 'noteheadTriangleUpDoubleWhole';
            break;
          case '1':
            code = 'noteheadTriangleUpWhole';
            break;
          case '2':
            code = 'noteheadTriangleUpHalf';
            break;
          default:
            code = 'noteheadTriangleUpBlack';
            break;
        }
        break;
      case 'TD':
        switch (duration) {
          case '1/2':
            code = 'noteheadTriangleDownDoubleWhole';
            break;
          case '1':
            code = 'noteheadTriangleDownWhole';
            break;
          case '2':
            code = 'noteheadTriangleDownHalf';
            break;
          default:
            code = 'noteheadTriangleDownBlack';
            break;
        }
        break;
      case 'SF':
        switch (duration) {
          case '1/2':
            code = 'noteheadSlashedDoubleWhole1';
            break;
          case '1':
            code = 'noteheadSlashedWhole1';
            break;
          case '2':
            code = 'noteheadSlashedHalf1';
            break;
          default:
            code = 'noteheadSlashedBlack1';
        }
        break;
      case 'SB':
        switch (duration) {
          case '1/2':
            code = 'noteheadSlashedDoubleWhole2';
            break;
          case '1':
            code = 'noteheadSlashedWhole2';
            break;
          case '2':
            code = 'noteheadSlashedHalf2';
            break;
          default:
            code = 'noteheadSlashedBlack2';
        }
        break;
    }
    return code;
  }

}

module.exports = {
  Fake,
}