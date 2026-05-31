using System;
using System.Collections.Generic;
using System.Text;

namespace diploma.core.Entities
{
    public class UserAddress
    {
        public int Id { get; set; }
        public string? UserId { get; set; }
        public string AddressName { get; set; } = "Main Address"; 

        public string DeliveryService { get; set; } = "NovaPoshta"; 
        public string DeliveryType { get; set; } = "Warehouse"; 

 
        public string Region { get; set; } = null!;
        public string City { get; set; } = null!;

     
        public string? WarehouseNumber { get; set; }

   
        public string? Street { get; set; }
        public string? Building { get; set; }
        public string? Floor { get; set; }
        public string? Apartment { get; set; }
        public bool HasElevator { get; set; }

        public bool IsDefault { get; set; }
    }
}
