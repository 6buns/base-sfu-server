module.exports = class Room {
  constructor(roomName, router, pipeTransport) {
    this.name = roomName;
    this.router = router;
    this.pipeTransport = pipeTransport || {};
    this.peers = new Map();
    this.hasProducers = false;
    this.consumerCount = 0;
  }

  _addPeer = (peer) => {
    this.peers.set(peer.socket.id, peer);
  };

  _getPeer = (sid) => {
    return this.peers.get(sid);
  };

  _countPeer = () => {
    return this.peers.size;
  };

  _informPeers = (sid, event, data, socket) => {
    if (this.peers.size > 1) {
      for (const [id, peer] of this.peers) {
        id !== sid && peer.socket.emit(event, { ...data });
      }
    }
  };

  _removePeer = (sid) => {
    this.peers.get(sid)._destroy()
    this.peers.delete(sid)
  };

  _getProducers = (sid) => {
    const prodList = [];
    for (const [id, peer] of this.peers) {
      if (peer.socket.id !== sid) {
        prodList.push(peer._getAllProducers());
      }
    }
    return [...prodList];
  };

  _getRoomStat = () => {
    return new Promise(async (resolve, reject) => {
      let roomStat = {};
      roomStat["name"] = this.name;
      roomStat["routerId"] = this.router.id;
      roomStat['timestamp'] = Date.now();
      roomStat['peers'] = this._countPeer();

      for (const [id, peer] of this.peers) {
        try {
          const peerStat = await peer._getPeerStat()
          roomStat[peer.socket.id] = peerStat
        } catch (error) {
          reject(error)
        }
      }

      resolve(roomStat)
    });
  }

  _closeRoom = () => {
    this.router.close()
  };

};
