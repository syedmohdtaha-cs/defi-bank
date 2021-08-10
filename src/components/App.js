import { Tabs, Tab } from 'react-bootstrap'
import dBank from '../abis/dBank.json'
import React, { Component } from 'react';
import Token from '../abis/Token.json'

import Web3 from 'web3';
import './App.css';

//h0m3w0rk - add new tab to check accrued interest

class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {

    //check if MetaMask exists
    if(typeof window.ethereum!=='undefined'){

      //assign to values to variables: web3, netId, accounts

      const web3 = new Web3(window.ethereum);
      const netId = await web3.eth.net.getId()
      const accounts = await web3.eth.getAccounts()
      console.log(accounts[0])
      console.log(netId)

      //load balance
      if(typeof accounts[0] !=='undefined'){
        const balance = await web3.eth.getBalance(accounts[0])
        this.setState({account: accounts[0], balance: balance, web3: web3})
      } else {
        window.alert('Please login with MetaMask')
      }
      try{
      const token = new web3.eth.Contract(Token.abi,Token.networks[netId].address);
      const dbank = new web3.eth.Contract(dBank.abi,dBank.networks[netId].address);
      const dBankAddress = dBank.networks[netId].address;
      console.log("bal",await web3.eth.getBalance(dbank.options.address))

      this.setState({token:token,dBankAddress:dBankAddress,dbank:dbank})
    }
    catch(e){
      console.log("Error",e);
      console.log("Contract is not deployed to current network")
    }


    }

    else {
      window.alert("please install Metamask extension in your browser")
    }

      //check if account is detected, then load balance&setStates, elsepush alert

      //in try block load contracts

    //if MetaMask not exists push alert
  }

  async deposit(amount) {
    if(this.state.dbank !== 'undefined'){
      try{
        await this.state.dbank.methods.deposit().send({value:amount.toString(),from:this.state.account})
        .on('confirmation', (reciept) => {
         
          window.location.reload()
        })
 
      }catch(error) {
        console.log("Error : deposit", error)
      }
    }

  }

  async withdraw(e) {
    //prevent button from default click
    //check if this.state.dbank is ok
    //in try block call dBank withdraw();
    e.preventDefault();
    if(this.state.dbank !== 'undefined'){
      try{
        await this.state.dbank.methods.withdraw().send({from:this.state.account})
        .on('confirmation', (reciept) => {
         
          window.location.reload()
        })
 
      }catch(error) {
        console.log("Error : deposit", error)
      }
    }
  }
  async borrow(amount) {
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.borrow().send({value: amount.toString(), from: this.state.account})
      } catch (e) {
        console.log('Error, borrow: ', e)
      }
    }
  }

  async payOff(e) {
    e.preventDefault()
    if(this.state.dbank!=='undefined'){
      try{
        const collateralEther = await this.state.dbank.methods.collateralEther(this.state.account).call({from: this.state.account})
        const tokenBorrowed = collateralEther/2
        await this.state.token.methods.approve(this.state.dBankAddress, tokenBorrowed.toString()).send({from: this.state.account})
        await this.state.dbank.methods.payOff().send({from: this.state.account})
      } catch(e) {
        console.log('Error, pay off: ', e)
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null
    }
  }

  render() {
    return (
      <div className='text-monospace main'>
        {/* <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
          >
       
          <b>dBank</b>
        </a>
        </nav> */}
        <div className="container-fluid mt-5 text-center">
        <br></br>
          <h2 className="text-white">DEFI : <small>{this.state.account}</small></h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto p-4 d-flex align-items-start">
              <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example" className="p-4 m-auto flex-column">
                <Tab eventKey="deposit" title="Deposit">
                 
                 <div className="text-white pt-4 pl-4" >
                   How much do u want to deposit?
                  <br></br>
                  (min. amount is 0.01 ETH)
                    <br></br>
                    (1 deposit is possible at the time)
                    <br></br>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      let amount = this.depositAmount.value
                      amount = amount * 10**18 //convert to wei
                      this.deposit(amount)
                    }}>
                      <div className='form-group mr-sm-2'>
                      <br></br>
                        <input
                          id='depositAmount'
                          step="0.01"
                          type='number'
                          ref={(input) => { this.depositAmount = input }}
                          className="form-control form-control-md"
                          placeholder='amount...'
                          required />
                      </div>
                      <button type='submit' className='btn btn-danger text-white'>DEPOSIT</button>
                    </form>
                 </div>

                </Tab>
                
                <Tab eventKey="withdraw" title="Withdraw" class="n1">
                 
                 <div className="text-white pt-5">
                   Do you want to withdraw with 
                   <br></br>ur additional benefits?
                  <br></br>
                  <br></br>
                  <div>
                    <button type='submit' className='btn btn-danger text-white' onClick={(e) => this.withdraw(e)}>WITHDRAW</button>
                  </div>
                 </div>

                </Tab>
                <Tab eventKey="borrow" title="Borrow" class="n1">
                  <div className="text-white">

                  <br></br>
                    Do you want to borrow tokens?
                    <br></br>
                    (You'll get 50% of collateral, in Tokens)
                    <br></br>
                    Type collateral amount (in ETH)
                    <br></br>
                    <br></br>
                    <form onSubmit={(e) => {

                      e.preventDefault()
                      let amount = this.borrowAmount.value
                      amount = amount * 10 **18 //convert to wei
                      this.borrow(amount)
                    }}>
                      <div className='form-group mr-sm-2'>
                        <input
                          id='borrowAmount'
                          step="0.01"
                          type='number'
                          ref={(input) => { this.borrowAmount = input }}
                          className="form-control form-control-md"
                          placeholder='amount...'
                          required />
                      </div>
                      <button type='submit' className='btn btn-danger'>BORROW</button>
                    </form>
                  </div>
                </Tab>
                <Tab eventKey="payOff" title="Payoff" class="n1">
                  <div className="text-white">

                  <br></br>
                    Do you want to payoff the loan?
                    <br></br>
                    (You'll receive your collateral - fee)
                    <br></br>
                    <br></br>
                    <button type='submit' className='btn btn-danger' onClick={(e) => this.payOff(e)}>PAYOFF</button>
                  </div>
                </Tab>
              </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;