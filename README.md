**RTSP-TO-HLS-STREAM**

Simple Node Rest API to convert RTSP (Real Time Stream Protocol) streams to HLS (HTTP Live Streaming) using ffmpeg.

**Run with Docker:**
```
docker run -p 8000:8000 -d dofafis/rtsp-to-hls-stream
```

**Run from source code**

1. First you must have ffmpeg installed on your machine:
Windows: http://blog.gregzaal.com/how-to-install-ffmpeg-on-windows/
Linux: https://www.tecmint.com/install-ffmpeg-in-linux/

2. Node 10+ (I recommend Node Version Manager - NVM to easily use various Node versions)

```
git clone https://github.coom/dofafis/rtsp-to-hls-stream
cd rtsp-to-hls-stream
npm i
node server.js
```

Endpoints:


**POST    /streams**

```
Request body:
{
      "rtsp": "rtsp://username:password@host:port/path/to/your/rtsp?queryparams=something"
}

Successful return:
{
      "streamURI": "/streams/1017e9b0a8fab49a18de0e4932f2c9c8.m3u8"
}
```

**GET  /streams/:streamhash.m3u8**
Example: /streams/1017e9b0a8fab49a18de0e4932f2c9c8.m3u8

**DELETE  /streams/:streamhash**
Example: /streams/1017e9b0a8fab49a18de0e4932f2c9c8
