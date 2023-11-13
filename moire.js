const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const buffer = document.createElement('canvas');
const buffer_ctx = buffer.getContext('2d');

const cw = buffer.width = canvas.width = window.innerWidth || 1280;
const ch = buffer.height = canvas.height = window.innerHeight || 720;

let image;
let startX = startY = oX = oY = 0;
let angle = 3;

const v = {
    type: 'dots',
    scale: 0,
    density: 5,
    anim: false,
    rot: false,

    reset: () => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        v.scale = 0, v.density = 5, angle = 3;
        v.rot = false;
        if (!v.anim) Loop();
        v.anim = false;
    },
}

function Dots () {
    image = ctx.createImageData(cw, ch);
    let dataLen = image.data.length;

    while (dataLen -= 4) {
        if (Math.random() < v.density / 100) image.data[dataLen + 3] = 255;
    }

    buffer_ctx.putImageData(image, 0, 0);
}

function Pattern(type) {
    let pt = document.createElement('canvas');
    let ptctx = pt.getContext('2d');
    buffer_ctx.clearRect(0, 0, cw, ch);

    if (type == 'chessboard') {

        let d = v.density;
        pt.width = d * 2, pt.height = d * 2;

        ptctx.fillRect(0, 0, d, d);
        ptctx.fillRect(d, d, d, d);
    }
    
    if (type == 'triangles') {

        let d = v.density + 4;
        pt.width = d, pt.height = d * 2;

        ptctx.moveTo(d / 2, 0);
        ptctx.lineTo(d, d);
        ptctx.lineTo(0, d);
        ptctx.lineTo(0, d * 2);
        ptctx.lineTo(d, d * 2);
        ptctx.lineTo(d, d);
        ptctx.lineTo(d / 2, d * 2);
        ptctx.lineTo(0, d);
        ptctx.fill();
    }
    
    buffer_ctx.fillStyle = buffer_ctx.createPattern(pt, "repeat");
    buffer_ctx.fillRect(0, 0, cw, ch);

    image = buffer_ctx.getImageData(0, 0, cw, ch);
}

function render() {
    ctx.putImageData(image, 0, 0);

    ctx.translate(cw / 2, ch / 2);
    ctx.rotate(angle * Math.PI / 180);
    ctx.translate(-cw / 2 , -ch / 2);

    ctx.translate(oX, oY);

    ctx.drawImage(buffer, v.scale / 2, v.scale / 2, cw - v.scale, ch - v.scale);
    v.rot ? (angle = .5, requestAnimationFrame(render)) : angle = 0;
}

canvas.addEventListener('mousewheel', e => {
    e.preventDefault();
    if (!v.rot) {
        if (e.deltaY < 0) {angle = 0.2}
            else {angle = -0.2}
        render();
    }
});

canvas.addEventListener('mousedown', e => {
    if (!v.rot && !v.anim) {
        startX = e.offsetX, startY = e.offsetY;
        canvas.addEventListener('mousemove', move, e);
    }
});

canvas.addEventListener('mouseup', () => {
    oX = oY = 0;
    canvas.removeEventListener('mousemove', move);
});

function move(e) {
    oX = (e.offsetX - startX) / 100, oY = (e.offsetY - startY) / 100;
    render();
}

const gui = new dat.GUI();

gui.add(v, 'reset').name('Reset');
const animChk = gui.add(v, 'anim').name('Pseudo Animation').listen()
    .onChange(() => {
        if (v.type == 'chessboard' || v.type == 'triangles') {v.anim = false; return}
        v.rot = false;
        if (v.anim) Loop();
    });

gui.add(v, 'rot').name('Auto rotation').listen()
    .onChange(() => {
        v.anim = false;
        render();
    });

gui.add(v, 'type', ['chessboard', 'triangles', 'dots']).name('Pattern type')
    .onChange((e) => {
        animChk.domElement.style.opacity = (e == 'dots') ? 1 : .3;
        v.anim = v.rot = false;
        Loop();
    });

gui.add(v, 'density', 1, 50, 1).name('Density').listen()
    .onFinishChange(() => {
        v.rot = v.anim = false;
        Loop();
    });

gui.add(v, 'scale', 0, 50).name('Scale').listen()
    .onChange(() => {
        if (!v.anim && !v.rot) render();
    });

function Loop() {
    (v.type == 'dots') ? Dots() : Pattern(v.type);
    render();
    if (v.anim) requestAnimationFrame(Loop);
}

Loop();