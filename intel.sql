# gyro table script

CREATE TABLE `gyro` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gx` decimal(10,4) NOT NULL,
  `gy` decimal(10,4) NOT NULL,
  `gz` decimal(10,4) NOT NULL,
  `createdat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
SELECT * FROM db.gyro;

# accel table script

CREATE TABLE `accel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ax` decimal(10,4) NOT NULL,
  `ay` decimal(10,4) NOT NULL,
  `az` decimal(10,4) NOT NULL,
  `createdat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
SELECT * FROM db.gyro;

CREATE TABLE `latlong` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `latval` decimal(14,10) NOT NULL,
  `longval` decimal(14,10) NOT NULL,
  `createdat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
SELECT * FROM db.latlong;
