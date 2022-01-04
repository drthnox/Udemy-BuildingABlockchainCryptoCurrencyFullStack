
class Blockchain {
  constructor() {
    const genesis = new Block('gen-data', 'gen-hash', 'gen-lastHash');
    this.chain = [genesis];
  }

  lightningHash = (data) => {
    return data + '*';
  }

  addBlock(data) {
    const lastHash = this.chain[this.chain.length-1].hash;
    const hash = lightningHash(data+lastHash);
    const newBlock = new Block(data, hash, lastHash);
    this.chain.push(newBlock);
  }
}
