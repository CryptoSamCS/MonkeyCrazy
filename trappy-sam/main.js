document.addEventListener('contextmenu', e => e.preventDefault())
document.addEventListener('selectstart', e => e.preventDefault())
document.addEventListener('dragstart',   e => e.preventDefault())

let cvs
let ctx
let description
let theme1
let theme2
let bg
let bird
let samImg
let trappysamImg
let charContainerImg
let bird1
let bird2
let pipes
let ground
let getReady
let gameOver
let map
let score
let gameState
let frame
let degree
const SFX_SCORE = new Audio()
const SFX_FLAP = new Audio()
const SFX_COLLISION = new Audio()
const SFX_FALL = new Audio()
const SFX_SWOOSH = new Audio()

;(function () {
    const l = document.createElement('link')
    l.rel  = 'stylesheet'
    l.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap'
    document.head.appendChild(l)
})()

cvs = document.getElementById('game')
ctx = cvs.getContext('2d')
description = document.getElementById('description')
theme1 = new Image()
theme1.src = 'img/og-theme.png'
theme2 = new Image()
theme2.src = 'img/og-theme-2.png'
samImg = new Image()
samImg.src = 'img/sam.png'
trappysamImg = new Image()
trappysamImg.src = 'img/trappysam.png'
charContainerImg = new Image()
charContainerImg.src = 'img/char.png'
const menuImg = new Image()
menuImg.src = 'img/menu.png'
frame = 0;
degree = Math.PI/180
SFX_SCORE.src = 'audio/sfx_point.mp3'
SFX_FLAP.src = 'audio/sfx_wing.mp3'
SFX_COLLISION.src = 'audio/sfx_hit.mp3'
SFX_FALL.src = 'audio/sfx_die.mp3'
SFX_SWOOSH.src = 'audio/sfx_swooshing.mp3'
const SFX_SLOT = new Audio()
SFX_SLOT.src = 'audio/slot.mp3'
const SFX_CD = new Audio()
SFX_CD.src = 'audio/sfx_cd.mp3'

const SONG_LIST = [
    { track: 1, name: 'MONKEY BIZZ',  discs: 0,  src: 'songs/MonkeyBizz.mp3'},
    { track: 2, name: 'RAPPING',  discs: 2, src: 'songs/PT.mp3'  },
]
let totalCDs     = parseInt(localStorage.getItem('totalCDs') || '0')
let selectedSongs = []
const mixtapeAudio  = new Audio()
mixtapeAudio.volume = 0.6
let mixtapeQueue    = []
let mixtapeQueuePos = 0

function mixtapeNext() {
    if (!mixtapeQueue.length) return
    mixtapeQueuePos = (mixtapeQueuePos + 1) % mixtapeQueue.length
    const song = SONG_LIST[mixtapeQueue[mixtapeQueuePos]]
    mixtapeAudio.src = song.src
    mixtapeAudio.currentTime = 0
    mixtapeAudio.play().catch(() => {})
}
mixtapeAudio.addEventListener('ended', mixtapeNext)

function startMixtape() {
    mixtapeQueue = selectedSongs.filter(i => totalCDs >= SONG_LIST[i].discs)
    if (!mixtapeQueue.length) return
    for (let i = mixtapeQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mixtapeQueue[i], mixtapeQueue[j]] = [mixtapeQueue[j], mixtapeQueue[i]]
    }
    mixtapeQueuePos = 0
    mixtapeAudio.src = SONG_LIST[mixtapeQueue[0]].src
    mixtapeAudio.currentTime = 0
    mixtapeAudio.play().catch(() => {})
}
function stopMixtape() {
    mixtapeAudio.pause()
    mixtapeAudio.currentTime = 0
}
const cdImg = new Image()
cdImg.src = 'img/cd.png'

let matrixCanvas = null
let matrixCtx    = null
const matrixRenderer = {
    cols: [],
    fontSize: 12,

    _ensureCanvas() {
        if (!matrixCanvas) {
            matrixCanvas = document.createElement('canvas')
            matrixCanvas.width  = cvs.width
            matrixCanvas.height = cvs.height
            matrixCtx = matrixCanvas.getContext('2d')
            this._reset()
        }
    },

    _reset() {
        if (!matrixCtx) return
        matrixCtx.fillStyle = '#000000'
        matrixCtx.fillRect(0, 0, cvs.width, cvs.height)
        this.fontSize = 12
        const numCols = Math.floor(cvs.width / this.fontSize)
        this.cols = []
        for (let i = 0; i < numCols; i++) {
            this.cols.push(Math.floor(Math.random() * (cvs.height / this.fontSize)))
        }
    },

    draw() {
        const charName = CHARACTER_LIST[characterSelector.currentIndex].name
        if (charName !== 'SEAN') {
            if (matrixCanvas) this._reset()
            return
        }

        this._ensureCanvas()

        const fs = this.fontSize
        const matrixChars = '0123456789'

        matrixCtx.fillStyle = 'rgba(0,0,0,0.07)'
        matrixCtx.fillRect(0, 0, cvs.width, cvs.height)

        for (let i = 0; i < this.cols.length; i++) {
            const ch = matrixChars[Math.floor(Math.random() * matrixChars.length)]
            const x  = i * fs
            const y  = this.cols[i] * fs

            matrixCtx.fillStyle = Math.random() > 0.92 ? '#ccffcc' : '#00ff41'
            matrixCtx.font = fs + 'px monospace'
            matrixCtx.fillText(ch, x, y)

            if (y > cvs.height && Math.random() > 0.975) {
                this.cols[i] = 0
            }
            this.cols[i]++
        }

        ctx.drawImage(matrixCanvas, 0, 0)
    }
}

const rainbowBg = {
    offset: 0,
    draw() {
        const charName = CHARACTER_LIST[characterSelector.currentIndex].name
        if (charName !== 'ZAKK') return

        this.offset = (this.offset + 1) % cvs.height

        const colors = ['#FF0000','#FF7F00','#FFFF00','#00CC00','#0000FF','#4B0082','#8F00FF']
        const stripeH = cvs.height / colors.length

        ctx.fillStyle = colors[0]
        ctx.fillRect(0, 0, cvs.width, cvs.height)

        for (let i = 0; i < colors.length; i++) {
            const baseY = i * stripeH - this.offset
            ctx.fillStyle = colors[i]

            ctx.fillRect(0, baseY,              cvs.width, stripeH + 1)
            ctx.fillRect(0, baseY + cvs.height, cvs.width, stripeH + 1)
        }
    }
}

const juneBg = {
    draw() {
        const charName = CHARACTER_LIST[characterSelector.currentIndex].name
        if (charName !== 'JUNE') return

        const grad = ctx.createLinearGradient(0, cvs.height, 0, 0)
        grad.addColorStop(0,   '#FFB6C1')
        grad.addColorStop(0.5, '#C9A7E0')
        grad.addColorStop(1,   '#4A90D9')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, cvs.width, cvs.height)
    }
}

const duckyBg = {
    draw() {
        const charName = CHARACTER_LIST[characterSelector.currentIndex].name
        if (charName !== 'DUCKY') return

        let grad = ctx.createRadialGradient(
            cvs.width/2, cvs.height/2, 0,
            cvs.width/2, cvs.height/2, cvs.width * 0.75
        )
        grad.addColorStop(0, '#fff372')
        grad.addColorStop(1, '#fbc030')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, cvs.width, cvs.height)

        const skyTop = 50
        const skyBot = cvs.height - bg.h
        const stripeH = (skyBot - skyTop) / 3

        ctx.fillStyle = '#CE1126'
        ctx.fillRect(0, skyTop,                cvs.width, stripeH + 1)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, skyTop + stripeH,      cvs.width, stripeH + 1)
        ctx.fillStyle = '#006847'
        ctx.fillRect(0, skyTop + stripeH * 2,  cvs.width, stripeH + 1)
    }
}

const timBg = {
    offset: 0,

    draw() {
        const charName = CHARACTER_LIST[characterSelector.currentIndex].name
        if (charName !== 'TIM') return

        this.offset = (this.offset + 1.5) % cvs.height

        const third = Math.floor(cvs.width / 3)
        ctx.fillStyle = '#E6A459'
        ctx.fillRect(0,           0, third,                   cvs.height)
        ctx.fillStyle = '#e33b1e'
        ctx.fillRect(third,       0, cvs.width - third * 2,   cvs.height)
        ctx.fillStyle = '#E6A459'
        ctx.fillRect(cvs.width - third, 0, third,             cvs.height)

        const stripeW   = 18
        const amplitude = 18
        const period    = 80
        const STEP_H    = 8
        const cx        = cvs.width / 2
        const outlineW  = 3

        for (let y = -STEP_H; y < cvs.height + STEP_H; y += STEP_H) {

            const sineY  = y + this.offset
            const wobble = Math.sin((sineY / period) * Math.PI * 2) * amplitude

            const snappedWobble = Math.round(wobble / 4) * 4
            const left = cx + snappedWobble - stripeW / 2

            ctx.fillStyle = '#000000'
            ctx.fillRect(
                left - outlineW,
                y,
                stripeW + outlineW * 2,
                STEP_H + 1
            )

            ctx.fillStyle = '#fcea23'
            ctx.fillRect(left, y, stripeW, STEP_H + 1)
        }
    }
}

const CHARACTER_LIST = [
    { file: 'img/characters/1.SAM.PNG',  name: 'SAM'  },
    { file: 'img/characters/2.ZAKK.PNG', name: 'ZAKK' },
    { file: 'img/characters/3.TIM.PNG', name: 'TIM' },
    { file: 'img/characters/4.DUCKY.PNG', name: 'DUCKY' },
    { file: 'img/characters/5.JUNE.PNG', name: 'JUNE' },
    { file: 'img/characters/6.SEAN.PNG', name: 'SEAN' },

]
const characterImgs = CHARACTER_LIST.map(c => {
    const img = new Image()
    img.src = c.file
    return img
})

const leverImgs = [1, 2, 3, 4, 5].map(n => {
    const img = new Image()
    img.src = `img/lever/LEVER${n}.PNG`
    return img
})

gameState = {
    current: 3,
    menu: 3,
    getReady: 0,
    play: 1,
    gameOver: 2,
    mixtape: 4
}

const characterSelector = {
    currentIndex: 0,

    leverFrame:     0,
    leverAnimating: false,
    leverAnimTimer: 0,
    LEVER_ANIM_SPEED: 3,

    slotScrolling:   false,
    slotOffsetY:     0,
    slotSpeed:       0,
    slotTargetIndex: 0,
    SLOT_CHAR_H:     0,

    NAME_REGION: { x1: 55,  y1: 58,  x2: 170, y2: 81  },
    CHAR_REGION: { x1: 15,  y1: 85,  x2: 209, y2: 146 },

    _leverRect:    null,
    _containerRect: { x: 0, y: 0, w: 0, h: 0 },

    getCurrentImg() {
        return characterImgs[this.currentIndex]
    },

    render() {
        if (gameState.current !== gameState.getReady) return
        const lSrc  = leverImgs[this.leverFrame]
        const lNatW = (lSrc && lSrc.naturalWidth)  ? lSrc.naturalWidth  : 40
        const lNatH = (lSrc && lSrc.naturalHeight) ? lSrc.naturalHeight : 80
	const LEVER_SCALE = 0.05
	const lScale = LEVER_SCALE
        const lW = lNatW * lScale
        const lH = lNatH * lScale

        const totalAvailW = cvs.width - lW - 20
        const natW0 = charContainerImg.naturalWidth  || 220
        const natH0 = charContainerImg.naturalHeight || 155
        let cImgW = Math.min(natW0, totalAvailW * 0.85)
        let cImgH = natH0 * (cImgW / natW0)

        const LOGO_H      = 140
        const LOGO_TOP    = 8
        const logoBottom  = LOGO_TOP + LOGO_H + 8
        const groundTop   = cvs.height - 112 - 6
        const availH      = groundTop - logoBottom
	let cy = logoBottom + (availH - cImgH) / 2 + 10
	const cx = cvs.width / 2 - cImgW / 2
        this._containerRect = { x: cx, y: cy, w: cImgW, h: cImgH }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(charContainerImg, cx, cy, cImgW, cImgH)

        const natW = charContainerImg.naturalWidth  || 220
        const natH = charContainerImg.naturalHeight || 155
        const sx   = cImgW / natW
        const sy   = cImgH / natH

        const cr    = this.CHAR_REGION
        const charX = cx + cr.x1 * sx
        const charY = cy + cr.y1 * sy
        const charW = (cr.x2 - cr.x1) * sx
        const charH = (cr.y2 - cr.y1) * sy
        this.SLOT_CHAR_H = charH

        ctx.save()
        ctx.beginPath()
        ctx.rect(charX, charY, charW, charH)
        ctx.clip()

        const n    = CHARACTER_LIST.length
        const cur  = this.currentIndex
        const nxt  = this.slotTargetIndex

        const curTopY = charY - this.slotOffsetY
        const nxtTopY = charY + charH - this.slotOffsetY

        const drawChar = (img, topY) => {
            if (!img || !img.naturalWidth) return
            const imgS  = Math.min(charW / img.naturalWidth, charH / img.naturalHeight)
            const drawW = img.naturalWidth  * imgS
            const drawH = img.naturalHeight * imgS
            ctx.drawImage(img,
                charX + (charW - drawW) / 2,
                topY  + (charH - drawH) / 2,
                drawW, drawH
            )
        }
        drawChar(characterImgs[cur], curTopY)
        drawChar(characterImgs[nxt], nxtTopY)

        ctx.restore()
        ctx.imageSmoothingEnabled = false

        const displayIndex = this.slotScrolling ? nxt : cur
        const nr    = this.NAME_REGION
        const txtX  = cx + nr.x1 * sx
        const txtY  = cy + nr.y1 * sy
        const txtW  = (nr.x2 - nr.x1) * sx
        const txtH  = (nr.y2 - nr.y1) * sy
        const name  = CHARACTER_LIST[displayIndex].name
        ctx.save()
        const fontSize = Math.max(6, Math.floor(txtH * 0.72))
        ctx.font         = `${fontSize}px 'Press Start 2P', monospace`
        ctx.fillStyle    = '#6e451f'
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(name, txtX + txtW / 2, txtY + txtH / 2)
        ctx.restore()

        const LEVER_GAP = 2
	const lX = cx + cImgW + LEVER_GAP
        const lY = cy + cImgH / 2 - lH / 2
        this._leverRect = { x: lX, y: lY, w: lW, h: lH }
        if (lSrc) ctx.drawImage(lSrc, lX, lY, lW, lH)
    },

    update() {
        if (gameState.current !== gameState.getReady) return
        if (this.leverAnimating) {
            this.leverAnimTimer++
            if (this.leverAnimTimer >= this.LEVER_ANIM_SPEED) {
                this.leverAnimTimer = 0
                this.leverFrame++
                if (this.leverFrame > 4) {
                    this.leverFrame     = 0
                    this.leverAnimating = false
                }
            }
        }

        if (this.slotScrolling) {
            const slotH = this.SLOT_CHAR_H || 60
            this.slotOffsetY += this.slotSpeed

            const remaining = slotH - this.slotOffsetY
            if (remaining <= slotH * 0.4) {
                this.slotSpeed *= 0.88
            }

            if (this.slotOffsetY >= slotH) {
                this.slotOffsetY    = 0
                this.slotSpeed      = 0
                this.slotScrolling  = false
                this.currentIndex   = this.slotTargetIndex
            }
        }
    },

clickLever() {
    if (!this.leverAnimating && !this.slotScrolling) {

        this.leverAnimating = true
        this.leverFrame     = 0
        this.leverAnimTimer = 0
        SFX_SLOT.currentTime = 0
        SFX_SLOT.play()

        this.slotTargetIndex = (this.currentIndex + 1) % CHARACTER_LIST.length
        this.slotScrolling   = true
        this.slotOffsetY     = 0

        this.slotSpeed       = 4
    }
},

    isLeverHit(mx, my) {
        if (!this._leverRect) return false
        const r = this._leverRect
        return mx >= r.x && mx <= r.x + r.w &&
               my >= r.y && my <= r.y + r.h
    }
}

bg = {

    imgX: 0,
    imgY: 0,
    width: 276,
    height: 228,

    x: 0,

    y: cvs.height - 228,
    w: 276,
    h: 228,
    dx: 1,

    render: function() {
        const rx = Math.round(this.x)
        ctx.drawImage(theme1, this.imgX,this.imgY,this.width,this.height, rx,this.y,this.w,this.h)

        ctx.drawImage(theme1, this.imgX,this.imgY,this.width,this.height, rx + this.width,this.y,this.w,this.h)

        ctx.drawImage(theme1, this.imgX,this.imgY,this.width,this.height, rx + this.width*2,this.y,this.w,this.h)
    },

    position: function () {

        if (gameState.current == gameState.getReady) {
            this.x = 0
        }

        if (gameState.current == gameState.menu || gameState.current == gameState.play) {

            this.x = Math.round((this.x - this.dx) % this.w)
        }
    }
}

pipes = {

    top: {
        imgX: 56,
        imgY: 323,
    },

    bot: {
        imgX: 84,
        imgY:323,
    },
    width: 26,
    height: 160,

    w: 55,
    h: 300,
    gap: 130,
    dx: 2,

    minY: -260,
    maxY: -40,
    
    pipeGenerator: [],
    
    reset: function() {
        this.pipeGenerator = []
        cdCollectibles.reset()
    },

    render: function() {

        for (let i = 0; i < this.pipeGenerator.length; i++) {
            let pipe = this.pipeGenerator[i]
            let topPipe = pipe.y
            let bottomPipe = pipe.y + this.gap + this.h

            ctx.drawImage(theme2, this.top.imgX,this.top.imgY,this.width,this.height, pipe.x,topPipe,this.w,this.h)
            ctx.drawImage(theme2, this.bot.imgX,this.bot.imgY,this.width,this.height, pipe.x,bottomPipe,this.w,this.h)
        }
    },
    position: function() {

        if (gameState.current !== gameState.play) {
            return
        }

        if (gameState.current == gameState.play) {
            

            if (frame%160 == 0) {
                const newPipeY = Math.floor((Math.random() * (this.maxY-this.minY+1)) + this.minY)
                this.pipeGenerator.push(
                    {
                        x: cvs.width,
                        y: newPipeY
                    }
                )

                cdCollectibles.trySpawn(newPipeY)
            }

            for (let i = 0; i < this.pipeGenerator.length; i++) {

                let pg = this.pipeGenerator[i]
                let b = {
                    left: bird.x - bird.r,
                    right: bird.x + bird.r,
                    top: bird.y - bird.r,
                    bottom: bird.y + bird.r,
                }
                let p = {
                    top: {
                        top: pg.y,
                        bottom: pg.y + this.h
                    },
                    bot: {
                        top: pg.y + this.h + this.gap,
                        bottom: pg.y + this.h*2 + this.gap
                    },
                    left: pg.x,
                    right: pg.x + this.w
                }

                pg.x -= this.dx
                

                if(pg.x < -this.w) {
                    this.pipeGenerator.shift()

                        score.current++

                        SFX_SCORE.currentTime = 0
                        SFX_SCORE.play()
                    }

                if (b.left < p.right &&
                    b.right > p.left &&
                    b.top < p.top.bottom &&
                    b.bottom > p.top.top) {
                        if (gameState.current === gameState.play) stopMixtape()
                        gameState.current = gameState.gameOver
                        SFX_COLLISION.play()
                }

                if (b.left < p.right &&
                    b.right > p.left &&
                    b.top < p.bot.bottom &&
                    b.bottom > p.bot.top) {
                        if (gameState.current === gameState.play) stopMixtape()
                        gameState.current = gameState.gameOver
                        SFX_COLLISION.play()
                }
            }
        }
    }
}

const cdCollectibles = {
    items: [],
    size:  28,
    dx:    2,
    spawnCounter: 0,
    SPAWN_EVERY: 3,

    reset() {
        this.items = []
        this.spawnCounter = 0
    },

    trySpawn(pipeY) {
        this.spawnCounter++
        if (this.spawnCounter % this.SPAWN_EVERY !== 0) return

        const gapTop    = pipeY + pipes.h + pipes.gap * 0.25
        const gapBot    = pipeY + pipes.h + pipes.gap * 0.75
        const cdY       = gapTop + Math.random() * (gapBot - gapTop)

        this.items.push({ x: cvs.width + 80, y: cdY, collected: false })
    },

    render() {
        if (gameState.current !== gameState.play) return
        const sz = this.size
        for (const cd of this.items) {
            if (cd.collected) continue
            if (cdImg.naturalWidth) {
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'
                ctx.drawImage(cdImg, cd.x - sz / 2, cd.y - sz / 2, sz, sz)
                ctx.imageSmoothingEnabled = false
            } else {

                ctx.fillStyle = '#c0c0c0'
                ctx.beginPath()
                ctx.arc(cd.x, cd.y, sz / 2, 0, Math.PI * 2)
                ctx.fill()
            }
        }
    },

    update() {
        if (gameState.current !== gameState.play) return
        const sz  = this.size
        const r   = sz / 2 + bird.r
        for (const cd of this.items) {
            if (cd.collected) continue
            cd.x -= this.dx

            const dx = cd.x - bird.x
            const dy = cd.y - bird.y
            if (Math.sqrt(dx * dx + dy * dy) < r) {
                cd.collected = true
                totalCDs++
                localStorage.setItem('totalCDs', totalCDs)
                SFX_CD.currentTime = 0
                SFX_CD.play()
            }
        }

        this.items = this.items.filter(cd => cd.x > -sz)
    },

    renderHUD() {
        if (gameState.current !== gameState.play) return
        const x = cvs.width - 38
        const y = 6
        const sz = 24
        if (cdImg.naturalWidth) {
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'
            ctx.drawImage(cdImg, x, y, sz, sz)
            ctx.imageSmoothingEnabled = false
        }
        ctx.save()
        ctx.font         = `7px 'Press Start 2P', monospace`
        ctx.fillStyle    = '#ffffff'
        ctx.strokeStyle  = '#423439'
        ctx.lineWidth    = 2
        ctx.textAlign    = 'left'
        ctx.textBaseline = 'top'
        ctx.strokeText(String(totalCDs), x + sz + 2, y + 2)
        ctx.fillText(String(totalCDs),   x + sz + 2, y + 2)
        ctx.restore()
    }
}

ground = {

    imgX: 276,
    imgY: 0,
    width: 224,
    height: 112,

    x: 0,
    y:cvs.height - 112,
    w:224,
    h:112,
    dx: 2,
    render: function() {
        ctx.drawImage(theme1, this.imgX,this.imgY,this.width,this.height, this.x,this.y,this.w,this.h)

        ctx.drawImage(theme1, this.imgX,this.imgY,this.width,this.height, this.x + this.width,this.y,this.w,this.h)
    },

    position: function() {
        if (gameState.current == gameState.getReady) {
            this.x = 0
        }
        if (gameState.current == gameState.menu || gameState.current == gameState.play) {

            this.x = (this.x-this.dx) % (this.w/2)
        }
    }
}

map = [
    num0 = {
        imgX: 496,
        imgY: 60,
        width: 12,
        height: 18
    },
    num1 = {
        imgX: 135,
        imgY: 455,
        width: 10,
        height: 18
    },
    num2 = {
        imgX: 292,
        imgY: 160,
        width: 12,
        height: 18
    },
    num3 = {
        imgX: 306,
        imgY: 160,
        width: 12,
        height: 18
    },
    num4 = {
        imgX: 320,
        imgY: 160,
        width: 12,
        height: 18
    },
    num5 = {
        imgX: 334,
        imgY: 160,
        width: 12,
        height: 18
    },
    num6 = {
        imgX: 292,
        imgY: 184,
        width: 12,
        height: 18
    },
    num7 = {
        imgX: 306,
        imgY: 184,
        width: 12,
        height: 18
    },
    num8 = {
        imgX: 320,
        imgY: 184,
        width: 12,
        height: 18
    },
    num9 = {
        imgX: 334,
        imgY: 184,
        width: 12,
        height: 18
    }    
]

score = {
    current: 0,
    best: parseInt(localStorage.getItem('bestScore') || '0'),

    x: cvs.width/2,
    y: 40,
    w: 15,
    h: 25,
    reset: function() {
        if (this.current > this.best) {
            this.best = this.current
            localStorage.setItem('bestScore', this.best)
        }
        this.current = 0
    },

    render: function() {
        if (gameState.current == gameState.play ||
            gameState.current == gameState.gameOver) {

            let string = this.current.toString()
            let ones = string.charAt(string.length-1)
            let tens = string.charAt(string.length-2)
            let hundreds = string.charAt(string.length-3)

            if (this.current >= 1000) {
                gameState.current = gameState.gameOver
            

            } else if (this.current >= 100) {
                ctx.drawImage(theme2, map[ones].imgX,map[ones].imgY,map[ones].width,map[ones].height, ( (this.x-this.w/2) + (this.w) + 3 ),this.y,this.w,this.h)

                ctx.drawImage(theme2, map[tens].imgX,map[tens].imgY,map[tens].width,map[tens].height, ( (this.x-this.w/2) ),this.y,this.w,this.h)

                ctx.drawImage(theme2, map[hundreds].imgX,map[hundreds].imgY,map[hundreds].width,map[hundreds].height, (   (this.x-this.w/2) - (this.w) - 3 ),this.y,this.w,this.h)

            } else if (this.current >= 10) {
                ctx.drawImage(theme2, map[ones].imgX,map[ones].imgY,map[ones].width,map[ones].height, ( (this.x-this.w/2) + (this.w/2) + 3 ),this.y,this.w,this.h)

                ctx.drawImage(theme2, map[tens].imgX,map[tens].imgY,map[tens].width,map[tens].height, ( (this.x-this.w/2) - (this.w/2) - 3 ),this.y,this.w,this.h)
            

            } else {
                ctx.drawImage(theme2, map[ones].imgX,map[ones].imgY,map[ones].width,map[ones].height, ( this.x-this.w/2 ),this.y,this.w,this.h)
            }
        }
    }
}    

bird = {
    animation: [
        {imgX: 276, imgY: 114},
        {imgX: 276, imgY: 140},
        {imgX: 276, imgY: 166},
        {imgX: 276, imgY: 140}
    ],
    fr: 0,

    width: 34,
    height: 24,

    x: 50,
    y: 160,
    w: 64,
    h: 64,

    r: 12,

    fly: 5.25,

    gravity: .32,

    velocity: 0,
    rotation: 0,

    render: function() {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)

        let currentImg = characterSelector.getCurrentImg()
        let natW = currentImg.naturalWidth  || this.w
        let natH = currentImg.naturalHeight || this.h
        let scale = Math.min(this.w / natW, this.h / natH)
        let drawW = natW * scale
        let drawH = natH * scale

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(currentImg, -drawW / 2, -drawH / 2, drawW, drawH)
        ctx.imageSmoothingEnabled = false
        ctx.restore()

        this.r = Math.min(drawW, drawH) / 2
    },

    flap: function() {
        this.velocity = - this.fly
    },

    position: function() {
        if (gameState.current == gameState.getReady) {
            this.y = 160
            this.rotation = 0 * degree

            if (frame%20 == 0) {
                this.fr += 1
            }

            if (this.fr > this.animation.length - 1) {
                this.fr = 0
            }

        } else {

            if (frame%4 == 0) {
                this.fr += 1
            }

            if (this.fr > this.animation.length - 1) {
                this.fr = 0
            }

            this.velocity += this.gravity
            this.y += this.velocity

            if (this.velocity <= this.fly) {
                this.rotation = -15 * degree
            } else if (this.velocity >= this.fly+2) {
                this.rotation = 70 * degree
                this.fr = 1
            } else {
                this.rotation = 0
            }

            if (this.y+this.h/2 >= cvs.height-ground.h) {
                this.y = cvs.height-ground.h - this.h/2

                if (frame%1 == 0) {
                    this.fr = 2
                    this.rotation = 70 * degree
                }

                if (gameState.current == gameState.play) {
                    stopMixtape()
                    gameState.current = gameState.gameOver
                    SFX_FALL.play()
                }
            }
            

            if (this.y-this.h/2 <= 0) {
                this.y = this.r
            }

        }
    }
}

bird1 = {

    animation: [
        {imgX: 115, imgY: 381},
        {imgX: 115, imgY: 407},
        {imgX: 115, imgY: 433},
        {imgX: 115, imgY: 407}
    ],
    fr: 0,

    width: 18,
    height: 12,

    x: 50,
    y: 160,
    w: 34,
    h: 24,

    r: 12,

    fly: 5.25,

    gravity: .32,

    velocity: 0,

    render: function() {
        let bird = this.animation[this.fr]

        ctx.drawImage(theme2, bird.imgX,bird.imgY,this.width,this.height, this.x-this.w/2,this.y-this.h/2,this.w,this.h)
    },

    flap: function() {
        this.velocity = - this.fly
    },

    position: function() {
        if (gameState.current == gameState.getReady) {
            this.y = 160

            if (frame%20 == 0) {
                this.fr += 1
            }

            if (this.fr > this.animation.length - 1) {
                this.fr = 0
            }

        } else {

            if (frame%4 == 0) {
                this.fr += 1
            }

            if (this.fr > this.animation.length - 1) {
                this.fr = 0
            }

            this.velocity += this.gravity
            this.y += this.velocity

            if (this.y+this.h/2 >= cvs.height-ground.h) {
                this.y = cvs.height-ground.h - this.h/2

                if (frame%1 == 0) {
                    this.fr = 2
                }

                if (gameState.current == gameState.play) {
                    gameState.current = gameState.gameOver
                    SFX_FALL.play()
                }
            }
            

            if (this.y-this.h/2 <= 0) {
                this.y = this.r
            }
        }
    }
}

bird2 = {

    animation: [
        {imgX: 87, imgY: 491},
        {imgX: 115, imgY: 329},
        {imgX: 115, imgY: 355},
        {imgX: 115, imgY: 329}
    ],
    fr: 0,

    imgX: 87,
    imgY: 491,
    width: 18,
    height: 12,

    x: 50,
    y: 160,
    w: 34,
    h: 24,

    r: 12,

    fly: 5.25,

    gravity: .32,

    velocity: 0,

    render: function() {
        let bird = this.animation[this.fr]

        ctx.drawImage(theme2, bird.imgX,bird.imgY,this.width,this.height, this.x-this.w/2,this.y-this.h/2,this.w,this.h)
    },

    flap: function() {
        this.velocity = - this.fly
    },

    position: function() {
        if (gameState.current == gameState.getReady) {
            this.y = 160

            if (frame%20 == 0) {
                this.fr += 1
            }

            if (this.fr > this.animation.length - 1) {
                this.fr = 0
            }

        } else {

            if (frame%4 == 0) {
                this.fr += 1
            }

            if (this.fr > this.animation.length - 1) {
                this.fr = 0
            }

            this.velocity += this.gravity
            this.y += this.velocity

            if (this.y+this.h/2 >= cvs.height-ground.h) {
                this.y = cvs.height-ground.h - this.h/2

                if (frame%1 == 0) {
                    this.fr = 2
                }

                if (gameState.current == gameState.play) {
                    gameState.current = gameState.gameOver
                    SFX_FALL.play()
                }
            }
            

            if (this.y-this.h/2 <= 0) {
                this.y = this.r
            }
        }
    }
}

getReady = {
    w: 290,
    h: 140,
    get x() { return cvs.width/2 - this.w/2 },
    get y() { return 8 },
    render: function() {
        if (gameState.current == gameState.menu || gameState.current == gameState.getReady) {
            let natW = trappysamImg.naturalWidth  || this.w
            let natH = trappysamImg.naturalHeight || this.h
            let scale = Math.min(this.w / natW, this.h / natH)
            let drawW = natW * scale
            let drawH = natH * scale
            let drawX = this.x + (this.w - drawW) / 2
            let drawY = this.y + (this.h - drawH) / 2
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'
            ctx.drawImage(trappysamImg, drawX, drawY, drawW, drawH)
            ctx.imageSmoothingEnabled = false
        }
    }
}

const menuOverlay = {
    _playRect:    null,
    _charRect:    null,
    _mixtapeRect: null,

    render() {
        if (gameState.current !== gameState.menu) return

        const natW = menuImg.naturalWidth  || 220
        const natH = menuImg.naturalHeight || 51

        const mW = cvs.width * 0.80
        const mH = natH * (mW / natW)
        const mX = cvs.width / 2 - mW / 2

        const logoBottom = getReady.y + getReady.h + 6
        const GAP = 4

        const playY    = logoBottom
        const charY    = playY + mH + GAP
        const mixtapeY = charY + mH + GAP

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        ctx.drawImage(menuImg, mX, playY,    mW, mH)
        ctx.drawImage(menuImg, mX, charY,    mW, mH)
        ctx.drawImage(menuImg, mX, mixtapeY, mW, mH)
        ctx.imageSmoothingEnabled = false

        const sx = mW / natW
        const sy = mH / natH

        const bx = mX + 8  * sx
        const bw = (212 - 8) * sx
        const by = 4  * sy
        const bh = (47 - 4) * sy

        this._playRect    = { x: bx, y: playY    + by, w: bw, h: bh }
        this._charRect    = { x: bx, y: charY    + by, w: bw, h: bh }
        this._mixtapeRect = { x: bx, y: mixtapeY + by, w: bw, h: bh }

        ctx.save()
        const fs = Math.max(6, Math.floor(bh * 0.45))
        ctx.font         = `${fs}px 'Press Start 2P', monospace`
        ctx.fillStyle    = '#6e451f'
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'

        const cx = bx + bw / 2
        ctx.fillText('PLAY',       cx, playY    + by + bh / 2)
        ctx.fillText('CHARACTERS', cx, charY    + by + bh / 2)
        ctx.fillText('MIXTAPES',   cx, mixtapeY + by + bh / 2)
        ctx.restore()
    },

    isPlayHit(mx, my) {
        const r = this._playRect
        return r && mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h
    },
    isCharHit(mx, my) {
        const r = this._charRect
        return r && mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h
    },
    isMixtapeHit(mx, my) {
        const r = this._mixtapeRect
        return r && mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h
    }
}

const mixtapeScreen = {
    render() {
        if (gameState.current !== gameState.mixtape) return

        ctx.save()
        ctx.fillStyle = 'rgba(0,0,0,0.78)'
        ctx.fillRect(0, 0, cvs.width, cvs.height)

        ctx.font         = '10px \'Press Start 2P\', monospace'
        ctx.fillStyle    = '#ffffff'
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText('MIXTAPES', cvs.width / 2, 14)

        this._renderCDCount(cvs.width - 40, 5)

        const startY  = 38
        const rowH    = 28
        const padX    = 14

        SONG_LIST.forEach((song, i) => {
            const unlocked = totalCDs >= song.discs
            const selected = selectedSongs.includes(i)
            const rowY = startY + i * rowH

            ctx.fillStyle = selected && unlocked ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'
            ctx.fillRect(padX, rowY, cvs.width - padX * 2, rowH - 2)

            ctx.font      = '7px \'Press Start 2P\', monospace'
            ctx.textAlign = 'left'
            ctx.fillStyle = unlocked ? (selected ? '#a8ff78' : '#ffffff') : '#888888'
            const icon    = !unlocked ? `[${song.discs}CD]` : (selected ? '[ON]' : '[  ]')
            ctx.fillText(icon, padX + 4, rowY + 8)

            ctx.fillStyle = unlocked ? '#ffffff' : '#666666'
            ctx.font      = '7px \'Press Start 2P\', monospace'
            ctx.fillText(`${song.track}. ${song.name}`, padX + 50, rowY + 8)

            ctx.textAlign = 'right'
            ctx.fillStyle = unlocked ? '#a8ff78' : '#ff6464'
            ctx.fillText(unlocked ? 'UNLOCKED' : `NEED ${song.discs} CDs`, cvs.width - padX - 4, rowY + 8)

            song._rowRect = { x: padX, y: rowY, w: cvs.width - padX * 2, h: rowH - 2 }
        })

        const backY = startY + SONG_LIST.length * rowH + 10
        ctx.font      = '7px \'Press Start 2P\', monospace'
        ctx.textAlign = 'center'
        ctx.fillStyle = '#aaaaaa'
        ctx.fillText('TAP ANYWHERE ELSE TO GO BACK', cvs.width / 2, backY)

        ctx.restore()
    },

    _renderCDCount(x, y) {
        const size = 14
        if (cdImg.naturalWidth) {
            ctx.drawImage(cdImg, x, y, size, size)
        }
        ctx.font         = '7px \'Press Start 2P\', monospace'
        ctx.fillStyle    = '#ffffff'
        ctx.strokeStyle  = '#423439'
        ctx.lineWidth    = 2
        ctx.textAlign    = 'left'
        ctx.textBaseline = 'top'
        ctx.strokeText(String(totalCDs), x + size + 2, y + 2)
        ctx.fillText(String(totalCDs),   x + size + 2, y + 2)
    },

    handleClick(mx, my) {

        for (let i = 0; i < SONG_LIST.length; i++) {
            const r = SONG_LIST[i]._rowRect
            if (r && mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
                if (totalCDs >= SONG_LIST[i].discs) {

                    const idx = selectedSongs.indexOf(i)
                    if (idx === -1) selectedSongs.push(i)
                    else selectedSongs.splice(idx, 1)
                }
                return true
            }
        }
        return false
    }
}

gameOver = {

    imgX: 174,
    imgY: 228,
    width: 226,
    height: 158,

    x: cvs.width/2 - 226/2,
    y: cvs.height/2 - 160,
    w: 226,
    h: 160,

    _drawNumber: function(value, rightX, topY) {
        const digits = String(Math.max(0, value)).split('')
        const dw = score.w
        const dh = score.h
        const gap = 2
        let curX = rightX
        for (let i = digits.length - 1; i >= 0; i--) {
            const d = parseInt(digits[i])
            const m = map[d]
            curX -= dw
            ctx.imageSmoothingEnabled = false
            ctx.drawImage(theme2, m.imgX, m.imgY, m.width, m.height, curX, topY, dw, dh)
            if (i > 0) curX -= gap
        }
    },

    _getMedal: function() {
        const s = score.current
        if      (s >= 50) return 'BR'
        else if (s >= 30) return 'BL'
        else if (s >= 15) return 'TR'
        else if (s >= 5 ) return 'TL'
        return null
    },

    render: function() {
        if (gameState.current == gameState.gameOver) {
            ctx.drawImage(theme1, this.imgX, this.imgY, this.width, this.height,
                          this.x, this.y, this.w, this.h)
            description.style.visibility = "visible"

            this._drawNumber(score.current,  331, 321)
            this._drawNumber(score.best || 0, 331, 364)

            const medal = this._getMedal()
            if (medal) {
                const srcW = 37, srcH = 46
                let srcX, srcY
                if      (medal === 'TL') { srcX = 331; srcY = 112 }
                else if (medal === 'TR') { srcX = 368; srcY = 112 }
                else if (medal === 'BL') { srcX = 331; srcY = 159 }
                else                    { srcX = 368; srcY = 159 }
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'
                ctx.drawImage(theme1, srcX, srcY, srcW, srcH,
                    222 - 22, 337 - 22, 44, 44)
                ctx.imageSmoothingEnabled = false
            }
        }
    }
}

let draw = () => {

    const _selectedCharName = CHARACTER_LIST[characterSelector.currentIndex].name

    if (_selectedCharName === 'SEAN') {

        matrixRenderer.draw()
    } else if (_selectedCharName === 'ZAKK') {
        rainbowBg.draw()
    } else if (_selectedCharName === 'JUNE') {
        juneBg.draw()
    } else if (_selectedCharName === 'DUCKY') {
        duckyBg.draw()
    } else if (_selectedCharName === 'TIM') {
        timBg.draw()
    } else {

        let grad = ctx.createRadialGradient(
            cvs.width/2, cvs.height/2, 0,
            cvs.width/2, cvs.height/2, cvs.width * 0.75
        )
        grad.addColorStop(0, '#fff372')
        grad.addColorStop(1, '#fbc030')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, cvs.width, cvs.height)
    }
    bg.render()
    pipes.render()
    cdCollectibles.render()
    ground.render()
    score.render()
    cdCollectibles.renderHUD()
    if (gameState.current == gameState.play || gameState.current == gameState.gameOver) {
        bird.render()
    }
    getReady.render()
    menuOverlay.render()
    characterSelector.render()
    mixtapeScreen.render()
    gameOver.render()
}

let update = () => {
    bird.position()
    bg.position()
    pipes.position()
    ground.position()
    characterSelector.update()
    cdCollectibles.update()
}

let loop = () => {
    draw()
    update()
    frame++

}
loop()
setInterval(loop, 17)

function canvasCoords(e) {
    const rect   = cvs.getBoundingClientRect()
    const scaleX = cvs.width  / rect.width
    const scaleY = cvs.height / rect.height
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top)  * scaleY
    }
}

cvs.addEventListener('click', (e) => {
    const { x: mx, y: my } = canvasCoords(e)

    if (gameState.current == gameState.mixtape) {
        const consumed = mixtapeScreen.handleClick(mx, my)
        if (!consumed) {
            gameState.current = gameState.menu
            SFX_SWOOSH.play()
        }
        return
    }

    if (gameState.current == gameState.menu) {
        if (menuOverlay.isPlayHit(mx, my)) {
            bird.y = 160
            bird.velocity = 0
            bird.rotation = 0
            gameState.current = gameState.play
            startMixtape()
            SFX_SWOOSH.play()
            return
        }
        if (menuOverlay.isCharHit(mx, my)) {
            gameState.current = gameState.getReady
            SFX_SWOOSH.play()
            return
        }
        if (menuOverlay.isMixtapeHit(mx, my)) {
            gameState.current = gameState.mixtape
            SFX_SWOOSH.play()
            return
        }
        return
    }

    if (gameState.current == gameState.getReady) {
        if (characterSelector.isLeverHit(mx, my)) {
            characterSelector.clickLever()
            return
        }
        gameState.current = gameState.menu
        SFX_SWOOSH.play()
        return
    }

    if (gameState.current == gameState.play) {
        bird.flap()
        SFX_FLAP.play()
        description.style.visibility = "hidden"
    }

    if (gameState.current == gameState.gameOver) {
        pipes.reset()
        score.reset()
        stopMixtape()
        gameState.current = gameState.menu
        SFX_SWOOSH.play()
    }
})

document.body.addEventListener('keydown', (e) => {
    if (e.keyCode == 32) {
        if (gameState.current == gameState.mixtape) {
            gameState.current = gameState.menu
            SFX_SWOOSH.play()
        } else if (gameState.current == gameState.menu) {
            bird.y = 160
            bird.velocity = 0
            bird.rotation = 0
            gameState.current = gameState.play
            startMixtape()
            SFX_SWOOSH.play()
        } else if (gameState.current == gameState.getReady) {
            gameState.current = gameState.menu
            SFX_SWOOSH.play()
        } else if (gameState.current == gameState.play) {
            bird.flap()
            SFX_FLAP.play()
            description.style.visibility = "hidden"
        } else if (gameState.current == gameState.gameOver) {
            pipes.reset()
            score.reset()
            stopMixtape()
            SFX_SWOOSH.play()
            gameState.current = gameState.menu
        }
    }
})