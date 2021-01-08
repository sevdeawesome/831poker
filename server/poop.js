

class poop{
  constructor(info)
  {

    this.info = info;
  }

  createNewPoop(POOP){
    let a = new poop(POOP);
    return a;
  }

  returnPoop(){
      console.log(this.info);
  }

}




module.exports = poop;
