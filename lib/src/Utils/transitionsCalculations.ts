export function getTransitionDurations(transitionName: string) {
    let enteringDuration = 0
    let leavingDuration = 0
    for (let i = 0; i < document.styleSheets.length; i++) {
        let rules: CSSStyleRule[] = [...document.styleSheets[i]['rules']] as CSSStyleRule[]
        for (let k = 0; k < rules.length; k++) {
            if (!rules[k]['selectorText']) continue
            if (
                rules[k]['selectorText'].indexOf(`.${transitionName}-enter-active`) !==
                -1
            ) {
                const duration = rules[k]['style']['transitionDuration']
                enteringDuration = getDuration(duration)
            }
            if (
                rules[k]['selectorText'].indexOf(`.${transitionName}-leave-active`) !==
                -1
            ) {
                const duration = rules[k]['style']['transitionDuration']
                leavingDuration = getDuration(duration)
            }
        }
    }
    return {
        enteringDuration,
        leavingDuration
    }
}

function getDuration(_duration: string) {
    let duration = _duration
    let durationNumber = 0
    if (duration.indexOf('ms') !== -1) {
        if (duration.indexOf(',') !== -1) {
            let durArray = duration.split(',')
            durArray.sort(function (a, b) {
                return (
                    Number(b.trim().replace('ms', '')) -
                    Number(a.trim().replace('ms', ''))
                )
            })
            duration = durArray[0]
        }
        duration = duration.replace('ms', '')
        durationNumber = Number(duration)
    } else if (duration.indexOf('s') !== -1) {
        if (duration.indexOf(',') !== -1) {
            let durArray = duration.split(',')
            durArray.sort(function (a, b) {
                return (
                    Number(b.trim().replace('s', '')) - Number(a.trim().replace('s', ''))
                )
            })
            duration = durArray[0]
        }
        if (duration.indexOf('.') === 0) duration = '0' + duration
        duration = duration.replace('s', '')
        durationNumber = Number(duration) * 1000
    }
    return durationNumber
}
