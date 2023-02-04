var uid=null;
AFRAME.registerComponent("marker-handler",{

    init:async function(){

        if (uid === null) {
            this.askuid();
          }

        var toys = await this.getToys();

        this.el.addEventListener("markerFound", () => {
            var markerId = this.el.id;      
            this.handleMarkerFound(toys, markerId);
          });

        this.el.addEventListener("markerLost", () => {
            this.handleMarkerLost();
          });
    },

    askuid: function() {
        var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
        
        swal({
          title:"Welcome to Toy Shop!!",
          icon: iconUrl,
          content: {
            element: "input",
            attributes: {
              placeholder: "Type your uid EX:(U01)",
              type: "number",
              min: 1
            }
          },
          closeOnClickOutside: false,
        }).then(inputValue=>{
          uid= inputValue
        })
        
      },

    handleMarkerFound:function(){
        var buttonDiv=document.getElementById("button-div")
        buttonDiv.style.display="flex"

        var ORDER_SUMMARY_Button=document.getElementById("summary-button")
        var orderButton=document.getElementById("order-button")

        ORDER_SUMMARY_Button.addEventListener("click",function(){
            swal({
                icon: "warning",
                title: "Order Summary",
                text: "Work in progress"
            })
        })

        orderButton.addEventListener("click",function(){
            swal({
                icon: "https://i.imgur.com/4NZ6uLY.jpg",
                title: "Thanks for Order!",
                text: "Your order will be come soon!",
            })
        })
        var toy = toys.filter(toys => toys.id === markerId)[0];

        var model = document.querySelector(`#model-${toy.id}`);
        model.setAttribute("position", toy.model_geometry.position);
        model.setAttribute("rotation", toy.model_geometry.rotation);
        model.setAttribute("scale", toy.model_geometry.scale);
    },
    handleOrder:function(uid,toy){
        firebase
            .firestore()
            .collection("users")
            .doc(uid)
            .get()
            .then(doc=>{
                var details=doc.data();

                if(details["current_orders"][toy.id]){
                    details["current_orders"][toy.id]["quantity"]+=1;

                    var currentQuantity=details["current_orders"][toy.id]["quantity"];

                    details["current_orders"][toy.id]["subtotal"]=
                        currentQuantity*toy.price;
                }else{
                    details["current_orders"][toy.id]={
                        item:toy.toy_name,
                        price:toy.price,
                        quantity:1,
                        subtotal:toy.price*1
                    };
                }

                details.total_bill+= toy.price;

                firebase
                    .firestore()
                    .collection("users")
                    .doc(doc.id)
                    .update(details);
            });
    },
    handleMarkerLost:function(){
        
        var buttonDiv = document.getElementById("button-div");
        buttonDiv.style.display = "none";

    },
    getToys: async function () {

        return await firebase
        .firestore()
        .collection("toys")
        .get()
        .then(snap => {
            return snap.docs.map(doc => doc.data());
      });
  }
})