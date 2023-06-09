let dispositivoSelecionado;
let characteristicSelecionada;
let server
async function listarDispositivos() {
  try {
    const dispositivos = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true
    });

    console.log(dispositivos);
    
    const dispositivosArray = [dispositivos]; // Colocando o único dispositivo em um array

    dispositivosArray.forEach(async (dispositivo) => {
      const item = document.createElement('li');
      item.textContent = dispositivo.name;

      item.addEventListener('click', async () => {
        await connectToDevice(dispositivo);
      });
      document.getElementById('dispositivos').appendChild(item);
    });
  } catch (erro) {
    console.error('Erro ao listar dispositivos Bluetooth:', erro);
  }
}


async function connectToDevice(dispositivo) {
  try {
    server = await dispositivo.gatt.connect();
    dispositivoSelecionado = dispositivo;
    mostrarInfoDispositivo(server);
  } catch (erro) {
    console.error('Erro ao conectar com dispositivo Bluetooth:', erro);
  }
}

function mostrarInfoDispositivo(server) {
  document.getElementById('info-dispositivo').style.display = 'block';
  document.getElementById('nome-dispositivo').textContent = JSON.stringify(dispositivoSelecionado);
  document.getElementById('id-dispositivo').textContent = dispositivoSelecionado;
  dispositivoSelecionado.gatt.connect().then(server => {
    const services = server.getPrimaryServices();
    console.log(services)
    services.then(pServices => {
      let servicePromises = [];
      pServices.forEach(pService => {
        servicePromises.push(getServiceCharacteristics(pService));
      });
      Promise.all(servicePromises).then(result => {
        const uuids = result.filter(uuid => uuid).join(', ');
        document.getElementById('gatt-servicos').textContent = uuids;
      });
    });
  });
}

async function getServiceCharacteristics(service) {
  let uuids = [];
  try {
    const characteristics = await service.getCharacteristics();
    characteristics.forEach(characteristic => {
      uuids.push(characteristic.uuid);
      // adicione um evento para receber notificações de mudanças de valor nesta característica
      characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
      characteristic.startNotifications();
    });
  } catch (error) {
    console.error('Erro ao obter características do serviço:', error);
  }
  return uuids.join(', ');
}

function handleCharacteristicValueChanged(event) {
  const value = event.target.value;
  // faça algo com o valor recebido
  alert('Valor recebido:', value);
}

