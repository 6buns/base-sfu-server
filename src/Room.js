module.exports = class Room {
  constructor(name, router, pipeTransport) {
    this.name = name;
    this.router = router;
    this.pipeTransport = pipeTransport || {};
    this.peers = new Map();
    this.hasProducers = false;
    this.consumerCount = 0;
    this.isOrign = Object.keys(this.pipeTransport).length > 0 ? false : true;
  }

  _addPeer = (peer) => this.peers.set(peer.socket.id, peer);

  _getPeer = (sid) => this.peers.get(sid);

  _hasPeer = (sid) => this.peers.has(sid)

  _countPeer = () => this.peers.size;

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
      roomStat['peers'] = []

      for (const [id, peer] of this.peers) {
        try {
          const peerStat = await peer._getPeerStat()
          roomStat['peers'].push(peerStat)
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
