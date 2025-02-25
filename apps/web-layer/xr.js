export function createXRButton(renderer, options) {
    if (options && options.referenceSpaceType) {
        renderer.xr.setReferenceSpaceType(options.referenceSpaceType);
    }
    // function showEnterVR(device:VRDisplay) {
    //   button.style.display = ''
    //   button.style.cursor = 'pointer'
    //   button.style.right = '20px'
    //   button.style.width = '100px'
    //   button.textContent = 'ENTER VR'
    //   button.onmouseenter = function() {
    //     button.style.opacity = '1.0'
    //   }
    //   button.onmouseleave = function() {
    //     button.style.opacity = '0.5'
    //   }
    //   button.onclick = function() {
    //     renderer.xr.enabled = !device.isPresenting
    //     device.isPresenting
    //       ? device.exitPresent()
    //       : device.requestPresent([{ source: renderer.domElement }]).catch(() => {
    //           renderer.xr.enabled = false
    //         })
    //   }
    //   renderer.xr.set(device)
    // }
    function showEnterXR() {
        var currentSession = null;
        function onSessionStarted(session) {
            session.addEventListener('end', onSessionEnded);
            renderer.vr.setSession(session);
            button.textContent = 'EXIT XR';
            currentSession = session;
        }
        function onSessionEnded(event) {
            currentSession
                .removeEventListener('end', onSessionEnded)(renderer.vr)
                .setSession(null);
            button.textContent = 'ENTER XR';
            currentSession = null;
        }
        //
        button.style.display = '';
        button.style.cursor = 'pointer';
        button.style.right = '20px';
        button.style.width = '100px';
        button.textContent = 'ENTER XR';
        button.onmouseenter = function () {
            button.style.opacity = '1.0';
        };
        button.onmouseleave = function () {
            button.style.opacity = '0.5';
        };
        button.onclick = function () {
            if (currentSession === null) {
                var sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor'] };
                navigator.xr.requestSession('immersive-vr', sessionInit).then(onSessionStarted);
                // var sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor' ] };
                // device
                //   .requestSession({ immersive: true, exclusive: true /* DEPRECATED */ })
                //   .then(onSessionStarted)
            }
            else {
                currentSession.end();
            }
        };
    }
    function showVRNotFound() {
        button.style.display = '';
        button.style.cursor = 'auto';
        button.style.right = '20px';
        button.style.width = '150px';
        button.textContent = 'XR NOT AVAILABLE';
        button.onmouseenter = null;
        button.onmouseleave = null;
        button.onclick = null;
        // renderer.xr.setDevice(null)
        renderer.xr.enabled = false;
    }
    function stylizeElement(element) {
        element.style.position = 'absolute';
        element.style.bottom = '20px';
        element.style.padding = '12px 6px';
        element.style.border = '1px solid #fff';
        element.style.borderRadius = '4px';
        element.style.background = 'rgba(0,0,0,0.1)';
        element.style.color = '#fff';
        element.style.font = 'normal 13px sans-serif';
        element.style.textAlign = 'center';
        element.style.opacity = '0.5';
        element.style.outline = 'none';
        element.style.zIndex = '999';
    }
    if ('xr' in navigator) {
        var button = document.createElement('button');
        button.style.display = 'none';
        stylizeElement(button);
        // ;(navigator as any).xr
        //   .requestDevice()
        //   .then(function(device) {
        //     device
        //       .supportsSession({ immersive: true, exclusive: true /* DEPRECATED */ })
        //       .then(function() {
        //         showEnterXR(device)
        //       })
        //       .catch(showVRNotFound)
        //   })
        //   .catch(showVRNotFound)
        return button;
    }
    // else if ('getVRDisplays' in navigator) {
    //   var button = document.createElement('button')
    //   button.style.display = 'none'
    //   stylizeElement(button)
    //   window.addEventListener(
    //     'vrdisplayconnect',
    //     function(event) {
    //       showEnterVR((event as any).display)
    //     },
    //     false
    //   )
    //   window.addEventListener(
    //     'vrdisplaydisconnect',
    //     function(event) {
    //       showVRNotFound()
    //     },
    //     false
    //   )
    //   window.addEventListener(
    //     'vrdisplaypresentchange',
    //     function(event) {
    //       button.textContent = (event as any).display.isPresenting ? 'EXIT VR' : 'ENTER VR'
    //     },
    //     false
    //   )
    //   window.addEventListener(
    //     'vrdisplayactivate',
    //     function(event) {
    //       ;(event as any).display.requestPresent([{ source: renderer.domElement }])
    //     },
    //     false
    //   )
    //   navigator
    //     .getVRDisplays()
    //     .then(function(displays) {
    //       if (displays.length > 0) {
    //         showEnterVR(displays[0])
    //       } else {
    //         showVRNotFound()
    //       }
    //     })
    //     .catch(showVRNotFound)
    // return button
    else {
        var message = document.createElement('a');
        message.innerHTML = 'XR DEVICE NOT FOUND';
        message.style.right = '20px';
        message.style.width = '180px';
        message.style.textDecoration = 'none';
        stylizeElement(message);
        return message;
    }
}
