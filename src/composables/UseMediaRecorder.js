
export default function () {

    let mediaRecorder;
    let stream;

    const getMic = async () => {
        try {
            stream = await navigator.mediaDevices
            .getUserMedia({
                audio: {
                    autoGainControl: false,
                    echoCancellation: false,
                    noiseSuppression: false,
                    channelCount: 1
                },
            })
        } catch (error) {
            console.log(error);
            alert("Microphone access error. Please refresh and try again.");
        }
    }

    let chunks = [];
    const startRecorder = async () => {
        if (stream == null) {
            await getMic();
        } else {
            let track = stream.getAudioTracks()[0];
            console.log(track.getSettings());
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            chunks = [];
            mediaRecorder.onstop = async function () {
                const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
                chunks = [];
                let audioBuffer = await blobToLeftChannelBuffer(blob)
                

                //use File API to save to local disk
                const wavblob = await generateWav(audioBuffer);
                
                try {
                    const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
                    const writable = await fileHandle.createWritable();
                    await writable.write(wavblob);
                    await writable.close();    
                } catch (error) {
                    console.log(error);
                    alert("unable to save " + filename)
                }
                
                
                //console.log(wavblob, filename);
              }
            mediaRecorder.ondataavailable = function (e) {
                chunks.push(e.data);
            };
        }
    }

    let filename;
    let directoryHandle;
    const stopRecorder = (_filename, _directoryHandle) => {
        filename = _filename;
        directoryHandle = _directoryHandle;
        mediaRecorder.stop();
    }

    const blobToLeftChannelBuffer = async (blob) => {
        const arrayBuffer = await blob.arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const leftChannelData = audioBuffer.getChannelData(0);
        const newAudioBuffer = audioContext.createBuffer(1, audioBuffer.length, audioBuffer.sampleRate);
        newAudioBuffer.copyToChannel(leftChannelData, 0);

        return newAudioBuffer;
    };

    async function generateWav(audioBuffer) {
        const numberOfChannels = audioBuffer.numberOfChannels;
        const length = audioBuffer.length * numberOfChannels * 2 + 44;
        const buffer = new ArrayBuffer(length);
        const view = new DataView(buffer);
        let pos = 0;

        // WAVE header
        function writeUTFBytes(view, pos, string) {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(pos + i, string.charCodeAt(i));
            }
        }

        writeUTFBytes(view, pos, 'RIFF'); pos += 4;
        view.setUint32(pos, length - 8, true); pos += 4;
        writeUTFBytes(view, pos, 'WAVE'); pos += 4;
        writeUTFBytes(view, pos, 'fmt '); pos += 4;
        view.setUint32(pos, 16, true); pos += 4;
        view.setUint16(pos, 1, true); pos += 2;
        view.setUint16(pos, numberOfChannels, true); pos += 2;
        view.setUint32(pos, audioBuffer.sampleRate, true); pos += 4;
        view.setUint32(pos, audioBuffer.sampleRate * 2 * numberOfChannels, true); pos += 4;
        view.setUint16(pos, numberOfChannels * 2, true); pos += 2;
        view.setUint16(pos, 16, true); pos += 2;
        writeUTFBytes(view, pos, 'data'); pos += 4;
        view.setUint32(pos, length - pos - 4, true); pos += 4;

        // Write the PCM samples
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            const channelData = audioBuffer.getChannelData(i);
            for (let j = 0; j < channelData.length; j++) {
                const sample = Math.max(-1, Math.min(1, channelData[j]));
                const intSample = sample < 0 ? sample * 32768 : sample * 32767;
                view.setInt16(pos, intSample, true);
                pos += 2;
            }
        }

        // Create a Blob
        const blob = new Blob([buffer], { type: 'audio/wav' });
        return blob;
    }

    return { getMic, startRecorder, stopRecorder };
};