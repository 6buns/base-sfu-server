module.exports = class Room {
  constructor(roomName, router) {
    this.name = roomName;
    this.router = router;
    this.peers = [];
    this.hasProducers = false;
    this.consumerCount = 0;
  }

  _addPeer = (peer) => {
    this.peers.push(peer);
  };

  _getPeer = (sid) => {
    return this.peers.find((peer) => peer.socket.id === sid);
  };

  _countPeer = () => {
    return this.peers.length;
  };

  _informPeers = (sid, event, data, socket) => {
    this.peers.length > 1 &&
      this.peers.forEach((peer) => {
        peer.socket.id !== sid && peer.socket.emit(event, { ...data });
      });
  };

  _removePeer = (sid) => {
    let i = this.peers.findIndex((peer) => peer.socket.id === sid);
    if (i === -1) return;
    this.peers[i]._destroy();
    this.peers.splice(i, 1);
  };

  _getProducers = (sid) => {
    const prodList = [];
    this.peers.forEach((peer) => {
      if (peer.socket.id !== sid) {
        prodList.push(peer._getAllProducers());
      }
    });
    return prodList;
  };
};
