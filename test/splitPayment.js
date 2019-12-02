
const SplitPayment = artifacts.require("SplitPayment");

contract('SplitPayment', (accounts) => {
  let splitPayment = null;
  before(async () => {
    splitPayment = await SplitPayment.deployed();
  });

  it('Debe hacer los pagos', async() => {
    const toPay = [accounts[1], accounts[2], accounts[3]];
    const amounts = [40, 20, 60];
    const initBalances = await Promise.all(toPay.map(recipient => {
      return web3.eth.getBalance(recipient);
    }));
    await splitPayment.send(
      toPay,
      amounts,
      {from: accounts[0], value: 150}
    );
    const finalBalances = await Promise.all(toPay.map(recipient => {
      return web3.eth.getBalance(recipient);
    }));
    toPay.forEach((_item, i) => {
      const finalBalance = web3.utils.toBN(finalBalances[i]);
      const initBalance = web3.utils.toBN(initBalances[i]);
      assert(finalBalance.sub(initBalance).toNumber() === amounts[i]);
    });
  });

  it('Si los arreglos no tienen la misma longitud', async() => {
    const toPay = [accounts[1], accounts[2], accounts[3]];
    const amounts = [40, 60];
    try {
      await splitPayment.send(
        toPay,
        amounts,
        {from: accounts[0], value: 150}
      );
    } catch (error) {
      assert(error.message.includes('Los Arreglos de las direcciones y cantidad deben tener la misma longitud'));
      return;
    }
    assert(false);
  });

  it('No hacer si no lo ejecuta el Owner', async() => {
    const toPay = [accounts[1], accounts[2], accounts[3]];
    const amounts = [40, 20, 60];
    try {
      await splitPayment.send(
        toPay,
        amounts,
        {from: accounts[5], value: 150}
      );
    } catch(error) {
      assert(error.message.includes('VM Exception while processing transaction: revert'));
      return;
    }
    assert(false);
  });
})