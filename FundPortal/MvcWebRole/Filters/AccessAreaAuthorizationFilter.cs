﻿using FundEntities;
using MvcWebRole.Extensions;
using MongoRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Filters;

namespace MvcWebRole.Filters
{
    public abstract class AccessAreaActionFilter : ActionFilterAttribute
    {
        protected bool  IsAuthorizedToAccessArea(string areaId)
        {
            // Ensure the request contains the areaId
            if (String.IsNullOrEmpty(areaId))
            {
                throw new HttpException(400, "BadRequest. Area not supplied.");
            }

            // Query for the area to match up its number to the associated Role.
            var areaRepository = new MongoRepository<Area>();
            var area = areaRepository.GetById(areaId);

            // Ensure the supplied area exists.
            if (area == null)
            {
                throw new HttpException(404, "NotFound. The requested area does not exist.");
            }

            // Ensure the user is in a role to allow accessing the area.
            foreach (var role in RoleValidator.GetAuthorizedRolesForArea(area))
            {
                if (HttpContext.Current.User.IsInRole(role))
                {
                    // Add the area to the Items dictionary to avoid duplicating the query.
                    HttpContext.Current.Items["area"] = area;
                    return true;
                }
            }
            
            return false;
        }
    }
}