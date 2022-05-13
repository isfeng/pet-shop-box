App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return App.initWeb3();
  },

  initWeb3: async function() {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        // await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        console.log('metamask installed')
        console.log(accounts)
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    } else {
      alert('please install metamask')
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      const contract = new ethers.Contract("0xEC237dfa34CD626539Ecd4c003722BC0347FC4D8", data.abi, signer)
      App.contracts.Adoption = contract

      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function() {
    console.log('mark adopted')
    App.contracts.Adoption.getAdopters().then((adopters) => {
      console.log(adopters)
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    })
  },

  handleAdopt: async function (event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    App.contracts.Adoption.adopt(petId, {from: accounts[0]})
      .then(function(result) {
        console.log(result)
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
