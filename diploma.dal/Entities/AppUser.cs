using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace diploma.dal.Entities
{
    public class AppUser : IdentityUser
    {
        public string FullName { get; set; }
        public string DeliveryAddress { get; set; }
        // Связь с вашей существующей таблицей заказов
        //public ICollection<Order> Orders { get; set; }
    }
}
