const ytdl = require('ytdl-core');
const {
    createAudioResource,
    StreamType
} = require('@discordjs/voice')

module.exports.streamYouTubeAudio = async (url) => {

    // Make a stream from the response
    let stream = await ytdl(
        url,
        {
            quality: 'highestaudio',
            volume: 0.2,
            f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
            highWaterMark: 1 << 26,
            filter: 'audioonly',
        }
    )

    // Return an audio resource from the stream
    return createAudioResource(stream, {
        inputType: StreamType.Arbitrary,
    });
}

// Register commands

// return new Promise((resolve, reject) => {
//     const process = ytdl(
//         this.url,
//         {
//             o: '-',
//             q: '',
//             f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
//             r: '100K',
//         },
//         { stdio: ['ignore', 'pipe', 'ignore'] },
//     );
//     if (!process.stdout) {
//         reject(new Error('No stdout'));
//         return;
//     }
//     const stream = process.stdout;
//     const onError = (error: Error) => {
//         if (!process.killed) process.kill();
//         stream.resume();
//         reject(error);
//     };
//     process
//         .once('spawn', () => {
//             demuxProbe(stream)
//                 .then((probe: { stream: any; type: any; }) => resolve(createAudioResource(probe.stream, { metadata: this, inputType: probe.type })))
//                 .catch(onError);
//         })
//         .catch(onError);
// });