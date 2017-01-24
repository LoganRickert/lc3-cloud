
var mtr = "<tr>\
    <th></th>\
    <th>Addr</th>\
    <th colspan='2'>Label</th>\
    <th>Hex</th>\
    <th colspan='3'>Instruction</th>\
    <th>ASCII</th>\
</tr>";

var rtr = "<tr>\
    <th>Name</th>\
    <th>Hex</th>\
    <th>Dec</th>\
    <th colspan='2'>ASCII</th>\
</tr>";

var paddingOffset = 0;

var filesLoaded = 0;

function itosh(i) {
    return "x" + (i | 0x10000).toString(16).substr(1,4).toUpperCase();
}

var gui = new GUI(document.getElementById("gui-output"));

var decoder = new Decoder();

var machine = new Machine();

var predict = false;

// Starting memory address
var sm = 0x3000;
var fpc = false;

function followPC() {
    fpc = !fpc;
    
    refreshView();
}

function shiftMemory(delta) {
    sm += delta
    loadMemory();
}

function setMemoryToPC() {
    sm = machine.getPC();
    loadMemory();
}

function togglePredict() {
    predict = !predict;
    refreshView();
}

function step() {
    this.machine.step();
}

var running = 0;

function run() {
    if (running === 0) {
        running = setInterval(function() {
            this.machine.step();
            }, document.getElementById("register-unit-default-run").value);
    } else {
        clearInterval(running);
        running = 0;
    }
}

var errorChecking = 0;

function checkForErrors() {
    if (errorChecking === 0) {
        errorChecking = setInterval(function() {
            checkErrors();
            clearInterval(errorChecking);
            errorChecking = 0;
            }, 1500);
    }
}

function actualErrorCheck(el) {
    var asmCommands = el.value.replace(/\r/g, "").split("\n");
    var asmP = new AsmParser();
    var asmE = "";
    var asmSpacerLength = asmCommands.length.toString().length;
    var asmSpacer = new Array(asmSpacerLength).join(" ");
    
    for (var i = 0; i < asmCommands.length; i++) {
        var asmLine = asmCommands[i];
        
        var fb = asmP.parse(".orig x0\n" + asmLine);
        
        if (!fb.errors) {
            for (var inst in fb.instructions) {
                var instruction = fb.instructions[inst]
                if (instruction.hex.error) {
                    asmE += "<span class='tooltip'>" + asmSpacer + "E<div class='tooltiptext'>" + instruction.hex.error + "</div></span>";
                    // asmE += "<span class='tooltip'>T</span>"
                    
                }
            }
        } // else {
        //     asmE += asmSpacer + "W";
        // }
        
        asmE += "\n";
    }
    
    $(el).parent().find(".line-warnings")[0].innerHTML = asmE;
}

function checkErrors() {
    console.log("Checking for le errors");
    $(".code-edit textarea").each(function(){
        actualErrorCheck(this);
    });
}

function getDefaultPC() {
    var num = NaN;
    var n = document.getElementById("register-unit-default-pc").value;
    
    if (n.length >= 2) {
        if (n[0] == "x") {
            n = n.slice(1);
            if (n.match("[0-9A-F]+")) {
                num = parseInt(n, 16);
            }
        } else if (n[0] == "#") {
            var sign = 1;
            
            if (n.length >= 3 && n[1] === '-') {
                sign = -1;
                n = n.slice(2);
            } else {
                n = n.slice(1);
            }
            
            num = sign * parseInt(n);
        }
    }
    
    if (isNaN(num)) {
        return null;
    } else {
        return num;
    }
}

function reset() {
    machine.newCPU();
    
    if (getDefaultPC() !== null) {
        this.machine.setPC(getDefaultPC());
    }
    
    clearInterval(running);
    running = 0;
    
    refreshView();
}

function hardReset() {
    machine = null;
    machine = new Machine();
    
    $(".code-edit textarea").each(function(){
        machine.loadAsm(this.value);
    });

    if (getDefaultPC() !== null) {
        machine.setPC(getDefaultPC());
    }
    
    gui.hide();
    gui.clear();
    clearInterval(running);
    running = 0;
    document.getElementById('console-output').value = "";
    
    setMemoryToPC();
    refreshView();
}

/*
    sm - Starting memory address
*/
function loadMemory() {
    var el = document.getElementById("memory-unit-memory");
    
    var newInner = mtr;
    
    var endingAddress = 0x8;
    
    var mm = sm
    
    if (fpc) mm = machine.getPC();
    
    for (var i = mm-1; i < mm + endingAddress-1; i++) {
        newInner += "<tr";
        
        if (machine.getPC() == i) {
            newInner += ' class="highlighted"';
        }
        
        newInner += ">";
        
        var mcell = machine.getMemoryCell(i);
        
        newInner += "<td><button id='memory-unit-breakpoint'>Br</button></td>\
            <td>" + itosh(i) + "</td>\
            <td colspan='2'>" + mcell.getLabel() + "</td>\
            <td>" + itosh(mcell.getHex()) + "</td>\
            <td colspan='3'>" + decoder.decode(mcell.getHex(), i, machine.getMemory(), machine.getCPU()) + "</td>\
            <td>" + String.fromCharCode((mcell.getHex() & 0xff00) >> 8) + String.fromCharCode(mcell.getHex() & 0xff) + "</td>";
        newInner += "</tr>";
    }
    
    el.innerHTML = newInner;
}

function loadRegisters() {
    var el = document.getElementById("register-unit-register");
    
    var newInner = rtr;
    
    var registerCount = 8;
    
    for (var i = 0; i < registerCount; i++) {
        var v = machine.getRegister(i).getValue();
        newInner += "<tr>\
            <td>R" + i + "</td>\
            <td>" + itosh(v) + "</td>\
            <td>" + v + "</td>\
            <td colspan='2'>" + String.fromCharCode(v) + "</td>";
        newInner += "</tr>";
    }
    
    var v = machine.getPC();
    newInner += "<tr>\
        <td>PC</td>\
        <td>" + itosh(v) + "</td>\
        <td>" + v + "</td>\
        <td colspan='2'>" + String.fromCharCode(v) + "</td>";
    newInner += "</tr>";
    
    var v = machine.getCC();
    newInner += "<tr>\
        <td>CC</td>\
        <td>" + ((v & 0b100) >> 2) + " " + ((v & 0b10) >> 1) + " " + (v & 0b1) + " " + "</td>\
        <td></td>\
        <td colspan='2'></td>";
    newInner += "</tr>";
    
    var v = machine.getIR();
    newInner += "<tr>\
        <td>IR</td>\
        <td>" + itosh(v) + "</td>\
        <td>" + v + "</td>\
        <td colspan='2'>" + decoder.decode(v, machine.getPC(), machine.getMemory(), machine.getCPU()) + "</td>";
    newInner += "</tr>";
    
    el.innerHTML = newInner;
}

function refreshView(shift = 0) {
    // var nsm = sm + shift;
    
    // sm = nsm;
    
    loadMemory();
    loadRegisters();
}

function recalcTextarea(el, override = false, numRows = -1) {
    var lines = numRows;
    
    if (numRows < 0) {
        lines = el.value.replace(/\r/g, "").split("\n").length;
    }
    
    if (override || el.rows !== lines + 1) {
        el.rows = lines + 1;
        
        var lineNumbers = "";
        
        for (var i = 1; i <= lines; i++) lineNumbers += i + "\n";
        
        el.style.padding = "5px 5px 5px " + (lines.toString().length + 2 + Math.floor(paddingOffset)) + "5px";
        
        $(el).parent().find(".line-numbers")[0].innerHTML = lineNumbers;
    }
}

function loadAsm(codeArea, isRaw = false) {
    if (isRaw) {
        machine.loadAsm(codeArea);
    } else {
        var el = document.getElementById(codeArea);
        machine.loadAsm(el.value);
    }
}

function save(codeArea) {
    var el = document.getElementById(codeArea);
}

function changeFontSize(codeArea, delta) {
    var el = document.getElementById(codeArea);
    
    var fs = el.style.fontSize;
    
    if (!fs) fs = "16";
    fs = parseInt(fs);

    paddingOffset += (delta / 6);
    
    el.style.fontSize = (fs + delta).toString() + "px";
    el.style.lineHeight = (fs + delta + 4).toString() + "px";
    $(el).parent().find(".line-numbers")[0].style.fontSize = (fs + delta).toString() + "px";
    $(el).parent().find(".line-numbers")[0].style.lineHeight = (fs + delta + 4).toString() + "px";
    $(el).parent().find(".line-warnings")[0].style.fontSize = (fs + delta).toString() + "px";
    $(el).parent().find(".line-warnings")[0].style.lineHeight = (fs + delta + 4).toString() + "px";
    // $(el).parent().find(".line-warnings")[0].style.width = (fs + delta + 4).toString() + "px";
    recalcTextarea(el, true);
}

function collapseCode(codeArea) {
    var el = document.getElementById(codeArea);
    
    if (el.rows === 4) {
        recalcTextarea(el, true);
    } else {
        recalcTextarea(el, true, 3);
    }
}

function appendFile(name = "", code = "", loadContents = false) {
    var el = document.getElementById("codeFiles");
    
    $("#codeFiles").append( `
    <div class="unit">
        <div class="unit-header">
            <label>Filename: <input id="filename` + filesLoaded + `" type="text" placeholder="main.asm" value=` + name + `></label>
            <p class="right">
                <button onclick='changeFontSize("code-area-text` + filesLoaded + `", 2)'>+</button>
                <button onclick='changeFontSize("code-area-text` + filesLoaded + `", -2)'>-</button>
                <button onclick='collapseCode("code-area-text` + filesLoaded + `")'>Collapse</button>
            </p>
            <p>
                <button onclick='save("code-area-text` + filesLoaded + `")'>Save</button>
                <button onclick='loadAsm("code-area-text` + filesLoaded + `")'>Load</button>
                <button>Download</button>
                <button>Compile</button>
                <button>Delete</button>
            </p>
        </div>
        <div class="unit-body">
            <div id="code-area-edit` + filesLoaded + `" class="code-edit">
                <form>
                    <div class="line-warnings"></div>
                    <div class="line-numbers"></div>
                    <textarea id="code-area-text` + filesLoaded + `">` + code + `</textarea>
                </form>
            </div>
        </div>
    </div>
    `);
    if (loadContents) loadAsm(code, true);
    recalcHandles("code-area-text" + filesLoaded);
    filesLoaded++;
    
}

function recalcHandles(el) {
    recalcTextarea(document.getElementById(el), true);
    
    el = '#' + el;
    
    $(el).bind('input propertychange', function() {
        recalcTextarea(this);
        clearInterval(errorChecking);
        errorChecking = 0;
        checkForErrors();
    });
    
    $(el).keydown(function(e) {
        if(e.keyCode === 9) { // tab was pressed
            // get caret position/selection
            var start = this.selectionStart;
            var end = this.selectionEnd;
    
            var $this = $(this);
            var value = $this.val();
    
            // set textarea value to: text before caret + tab + text after caret
            $this.val(value.substring(0, start)
                        + "\t"
                        + value.substring(end));
    
            // put caret at right position again (add one for the tab)
            this.selectionStart = this.selectionEnd = start + 1;
    
            // prevent the focus lose
            e.preventDefault();
        }
    });
}

function loadAllFiles() {
    if (codeFiles) {
        for (var i = 0; i < codeFiles.length; i++) {
            var fileContents = codeFiles[i];
            
            appendFile(fileContents.name, fileContents.code, i > 0);
        }
        
        loadAsm(codeFiles[0].code, true);
    }
    
    if (getDefaultPC() !== null) {
        machine.setPC(getDefaultPC());
    }

    setMemoryToPC();
    refreshView();
}

function outputKey(k) {
    var consoleta = document.getElementById('console-output');

    consoleta.value += String.fromCharCode(k & 0xff);
    
    if (consoleta.value.length >= 3000) {
        consoleta.value = consoleta.value.substr(consoleta.value.length-3000);
    }

    consoleta.scrollTop = consoleta.scrollHeight;
}

loadAllFiles();
refreshView();

var consoleta = document.getElementById('console-output');
consoleta.scrollTop = consoleta.scrollHeight;

$(consoleta).keypress(function(e) {
    e.preventDefault();
    machine.keyPressed(e.keyCode);
    refreshView();
});

$(consoleta).keydown(function(event) {
    if (event.which == 8) {
     event.preventDefault();
   }
});

checkErrors();
