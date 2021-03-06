
class MemoryCell {
    constructor(label = "", hex = 0) {
        this.label = label;
        this.hex = hex;
    }
    
    getLabel() {
        return this.label;
    }
    
    getHex() {
        return this.hex;
    }
    
    setLabel(name) {
        this.label = name;
    }
    
    setHex(h) {
        this.hex = h;
    }
}

class Memory {
    constructor(memLength) {
        this.memLength = memLength;
        
        // Addresses copied from https://github.com/wchargin/lc3web/blob/assembler/js/lc3_os.js
        this.memory = {
            // Trap vector table (valid entries)
            0x0020: 0x0400,
            0x0021: 0x0430,
            0x0022: 0x0450,
            0x0023: 0x04A0,
            0x0024: 0x04E0,
            0x0025: 0xFD70,
            // Implementation of GETC
            0x0400: 0x3E07,
            0x0401: 0xA004,
            0x0402: 0x07FE,
            0x0403: 0xA003,
            0x0404: 0x2E03,
            0x0405: 0xC1C0,
            0x0406: 0xFE00,
            0x0407: 0xFE02,
            // Implementation of OUT
            0x0430: 0x3E0A,
            0x0431: 0x3208,
            0x0432: 0xA205,
            0x0433: 0x07FE,
            0x0434: 0xB004,
            0x0435: 0x2204,
            0x0436: 0x2E04,
            0x0437: 0xC1C0,
            0x0438: 0xFE04,
            0x0439: 0xFE06,
            // Implementation of PUTS
            0x0450: 0x3E16,
            0x0451: 0x3012,
            0x0452: 0x3212,
            0x0453: 0x3412,
            0x0454: 0x6200,
            0x0455: 0x0405,
            0x0456: 0xA409,
            0x0457: 0x07FE,
            0x0458: 0xB208,
            0x0459: 0x1021,
            0x045A: 0x0FF9,
            0x045B: 0x2008,
            0x045C: 0x2208,
            0x045D: 0x2408,
            0x045E: 0x2E08,
            0x045F: 0xC1C0,
            0x0460: 0xFE04,
            0x0461: 0xFE06,
            0x0462: 0xF3FD,
            0x0463: 0xF3FE,
            // Implementation of IN
            0x04A0: 0x3E27,
            0x04A1: 0x3625,
            0x04A2: 0x3423,
            0x04A3: 0x3221,
            0x04A4: 0x201F,
            0x04A5: 0x4813,
            0x04A6: 0xE222,
            0x04A7: 0x6040,
            0x04A8: 0x0403,
            0x04A9: 0x480F,
            0x04AA: 0x1261,
            0x04AB: 0x0FFB,
            0x04AC: 0xA616,
            0x04AD: 0x07FE,
            0x04AE: 0xA013,
            0x04AF: 0x1420,
            0x04B0: 0x4808,
            0x04B1: 0x2012,
            0x04B2: 0x4806,
            0x04B3: 0x10A0,
            0x04B4: 0x2210,
            0x04B5: 0x2410,
            0x04B6: 0x2610,
            0x04B7: 0x2E10,
            0x04B8: 0xC1C0,
            0x04B9: 0x3E05,
            0x04BA: 0xA606,
            0x04BB: 0x07FD,
            0x04BC: 0xB003,
            0x04BD: 0x2E01,
            0x04BE: 0xC1C0,
            0x04C0: 0xFE06,
            0x04C1: 0xFE04,
            0x04C2: 0xFE02,
            0x04C3: 0xFE00,
            // Implementation of PUTSP
            0x04E0: 0x3E27,
            0x04E1: 0x3022,
            0x04E2: 0x3222,
            0x04E3: 0x3422,
            0x04E4: 0x3622,
            0x04E5: 0x1220,
            0x04E6: 0x6040,
            0x04E7: 0x0406,
            0x04E8: 0x480D,
            0x04E9: 0x2418,
            0x04EA: 0x5002,
            0x04EB: 0x0402,
            0x04EC: 0x1261,
            0x04ED: 0x0FF8,
            0x04EE: 0x2014,
            0x04EF: 0x4806,
            0x04F0: 0x2013,
            0x04F1: 0x2213,
            0x04F2: 0x2413,
            0x04F3: 0x2613,
            0x04F4: 0x2E13,
            0x04F5: 0xC1C0,
            0x04F6: 0x3E06,
            0x04F7: 0xA607,
            0x04F8: 0x0801,
            0x04F9: 0x0FFC,
            0x04FA: 0xB003,
            0x04FB: 0x2E01,
            0x04FC: 0xC1C0,
            0x04FE: 0xFE06,
            0x04FF: 0xFE04,
            0x0500: 0xF3FD,
            0x0501: 0xF3FE,
            0x0502: 0xFF00,
            // Implementation of HALT
            0xFD00: 0x3E3E,
            0xFD01: 0x303C,
            0xFD02: 0x2007,
            0xFD03: 0xF021,
            0xFD04: 0xE006,
            0xFD05: 0xF022,
            0xFD06: 0xF025,
            0xFD07: 0x2036,
            0xFD08: 0x2E36,
            0xFD09: 0xC1C0,
            0xFD70: 0x3E0E,
            0xFD71: 0x320C,
            0xFD72: 0x300A,
            0xFD73: 0xE00C,
            0xFD74: 0xF022,
            0xFD75: 0xA22F,
            0xFD76: 0x202F,
            0xFD77: 0x5040,
            0xFD78: 0xB02C,
            0xFD79: 0x2003,
            0xFD7A: 0x2203,
            0xFD7B: 0x2E03,
            0xFD7C: 0x0FFF, // I changed 0xC1C0 to 0x0DFF
                            // This way HALT stops the processor.
                            // MCR 'xFFFE' isn't implemented yet lol.
            /* the "halting the processor" message goes here */
            0xFDA5: 0xFFFE,
            0xFDA6: 0x7FFF,
            // Display status register
            0xFE04: 0x8000,
            // Machine control register
            0xFFFE: 0xFFFF,
            
            // KBSR
            0xFE00: 0x0,
            // KBDR
            0xFE02: 0x0,
            
            // GUI Status -- Ready for next
            0xFE10: 0x8000,
            // GUI Data
            // Write to this to output to screen.
            // 16-8: y
            // 7-0: x
            0xFE11: 0x0,
            
            // 16-8: height
            // 7-0: width
            0xFE12: 0x0101,
            
            // GUI Color -- What color to write
            // xf000 = r
            // xf00 = g
            // xf0 = b
            // xf = a
            0xFE13: 0xDDDF,
            // Clear screen -- Write #1
            0xFE14: 0x0,
            // Toggle GUI. x8000 On, x0 off
            0xFE15: 0x0
        };
        
        for (var i in this.memory) {
            this.memory[i] = new MemoryCell("", this.memory[i]);
        }
        
        this.memory[0x0400].setLabel("TRAP_GETC");
        this.memory[0x0430].setLabel("TRAP_OUT");
        this.memory[0x0450].setLabel("TRAP_PUTS");
        this.memory[0x04A0].setLabel("TRAP_IN");
        this.memory[0x04E0].setLabel("TRAP_PUTSP");
        this.memory[0xFD70].setLabel("TRAP_HALT");
        
        for (var i = 0; i < 0xFF; i++) {
            if (this.memory[i] === undefined) {
                this.memory[i] = new MemoryCell("", 0xFD00);
            }
        }
        
        // Fill in halt message
        var haltMessage = '\n----- Halting the processor ----- \n\0';
        for (var i = 0; i < haltMessage.length; i++) {
            this.memory[0xFD80 + i] = new MemoryCell("", haltMessage.charCodeAt(i));
        }
    }
    
    getMemoryCell(i, ignore = true) {
        var m = this.memory[i] !== undefined ? this.memory[i] : new MemoryCell();
        
        if (i == 0xFE02 && !ignore) {
            this.updateMemoryCell(0xfe00, 0);
        } else if (i == 0xFE20 && !ignore) {
            return new MemoryCell("", (Math.random() * 0xffff) & 0xffff);
        }
        
        return m;
    }
    
    setMemoryCell(i, x) {
        this.memory[i] = x;
    }
    
    updateMemoryCell(i, x) {
        if (i === 0xFE06) {
            outputKey(x);
        } else if (i == 0xFE14) {
            gui.clear();
        } else if (i == 0xFE16) {
            if (x === 0) gui.hide();
            else gui.show();
        } else if (i == 0xFE11) {
            var py = (x & 0xff00) >> 8;
            var px = (x & 0xff);
            
            var wh = this.getMemoryCell(0xFE12, true).getHex();
            var h = (wh & 0xff00) >> 8;
            var w = (wh & 0xff);
            
            var c = this.getMemoryCell(0xFE13, true).getHex();
            var r = (c & 0xf000) >> 12;
            var g = (c & 0xf00) >> 8;
            var b = (c & 0xf0) >> 4;
            var a = (c & 0xf);
        
            gui.draw(px, py, w, h, r, g, b, a/15);
        }
        else {
            var g = this.getMemoryCell(i);
            g.setHex(x);
            this.memory[i] = g;
        }
    }
    
    keyPressed(k) {
        this.updateMemoryCell(0xfe02, k);
        this.updateMemoryCell(0xfe00, 0x8000);
    }
}
